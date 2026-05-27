from supabase import create_client, Client
from app.config.settings import settings

# Create client: supabase = create_client(URL, KEY)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
