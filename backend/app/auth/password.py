import bcrypt

def hash_password(password: str) -> str:
    # generates bcrypt salt
    salt = bcrypt.gensalt()
    # hashes password
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    # returns decoded string
    return hashed.decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    # compares plain against hashed using bcrypt
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False
