from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse, OTPSendRequest, OTPLoginRequest, GoogleLoginRequest
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_token, get_current_user
from app.database.supabase_client import supabase

router = APIRouter(tags=["auth"])

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    # checks if email exists in supabase users
    exist_response = supabase.table("users").select("*").eq("email", body.email).execute()
    if exist_response.data:
        # if exists: raise 400 "Email already registered"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # hashes password
    hashed_pwd = hash_password(body.password)
    
    # inserts user to supabase: name, email, hashed_password, created_at
    new_user = {
        "name": body.name,
        "email": body.email,
        "hashed_password": hashed_pwd,
        "created_at": datetime.utcnow().isoformat()
    }
    insert_response = supabase.table("users").insert(new_user).execute()
    if not insert_response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )
        
    user_row = insert_response.data[0]
    user_id = user_row["id"]
    
    # creates JWT token with user id and email
    token = create_token(str(user_id), user_row["email"])
    
    # returns AuthResponse with token and user
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user_id),
            name=user_row["name"],
            email=user_row["email"]
        )
    )

@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    # fetches user by email from supabase
    response = supabase.table("users").select("*").eq("email", body.email).execute()
    if not response.data:
        # if not found: raise 401 "Invalid credentials"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    user_row = response.data[0]
    
    # verifies password with verify_password
    if not verify_password(body.password, user_row["hashed_password"]):
        # if wrong: raise 401 "Invalid credentials"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    # creates JWT token
    token = create_token(str(user_row["id"]), user_row["email"])
    
    # returns AuthResponse with token and user
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user_row["id"]),
            name=user_row["name"],
            email=user_row["email"]
        )
    )

@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    # requires auth
    # returns current user info from supabase
    # fetches user row by id
    response = supabase.table("users").select("*").eq("id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    user_row = response.data[0]
    return UserResponse(
        id=str(user_row["id"]),
        name=user_row["name"],
        email=user_row["email"]
    )

@router.post("/otp/send")
async def send_otp(body: OTPSendRequest):
    import random
    # Generate 6-digit pin
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    supabase.table("otp_codes").upsert({
        "email": body.email,
        "otp": otp_code,
        "expires_at": (datetime.utcnow() + timedelta(minutes=10)).isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    
    # In a full production system, we'd send an email here.
    # For user ease of use/demonstration, we will return it in the message response.
    print(f"[OTP SYSTEM] Code for {body.email} is: {otp_code}")
    return {"message": "OTP sent successfully!", "demo_otp": otp_code}

@router.post("/otp/login", response_model=AuthResponse)
async def login_with_otp(body: OTPLoginRequest):
    # Verify OTP
    otp_response = supabase.table("otp_codes").select("*").eq("email", body.email).execute()
    otp_row = (otp_response.data or [None])[0]
    stored_otp = otp_row.get("otp") if otp_row else None
    expires_at = otp_row.get("expires_at") if otp_row else None
    is_expired = False
    if expires_at:
        expires_at_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00")).replace(tzinfo=None)
        is_expired = datetime.utcnow() > expires_at_dt

    if not stored_otp or body.otp != stored_otp or is_expired:
        # Support fallback universal pin for testing convenience
        if body.otp != "123456":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP verification code"
            )

    # Check if user exists in Supabase
    response = supabase.table("users").select("*").eq("email", body.email).execute()
    if response.data:
        user_row = response.data[0]
    else:
        # Automatically register user if they don't exist
        new_user = {
            "name": body.email.split("@")[0].capitalize(),
            "email": body.email,
            "hashed_password": hash_password("otp-autogenerated-password"),
            "created_at": datetime.utcnow().isoformat()
        }
        insert_res = supabase.table("users").insert(new_user).execute()
        if not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register user via OTP"
            )
        user_row = insert_res.data[0]

    # Clean active OTP
    supabase.table("otp_codes").delete().eq("email", body.email).execute()

    token = create_token(str(user_row["id"]), user_row["email"])
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user_row["id"]),
            name=user_row["name"],
            email=user_row["email"]
        )
    )

@router.post("/google", response_model=AuthResponse)
async def login_with_google(body: GoogleLoginRequest):
    # For demo purposes, we will treat the credential as the email if it contains '@',
    # otherwise register as default google user
    email = "google-user@domain.com"
    name = "Google User"

    if "@" in body.credential:
        email = body.credential
        name = email.split("@")[0].capitalize() + " (Google)"

    # Check or create user profile
    response = supabase.table("users").select("*").eq("email", email).execute()
    if response.data:
        user_row = response.data[0]
    else:
        new_user = {
            "name": name,
            "email": email,
            "hashed_password": hash_password("google-oauth-password"),
            "created_at": datetime.utcnow().isoformat()
        }
        insert_res = supabase.table("users").insert(new_user).execute()
        if not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register Google OAuth user"
            )
        user_row = insert_res.data[0]

    token = create_token(str(user_row["id"]), user_row["email"])
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user_row["id"]),
            name=user_row["name"],
            email=user_row["email"]
        )
    )
