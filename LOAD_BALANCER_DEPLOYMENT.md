# Backend Load Balancer Deployment

The Vercel frontend is already globally load balanced by Vercel. This setup adds load balancing for the FastAPI backend by running three backend containers behind Nginx.

## Architecture

```txt
Vercel Frontend
      |
      v
Backend Domain / Server IP
      |
      v
Nginx Load Balancer
      |
      +-- FastAPI api1
      +-- FastAPI api2
      +-- FastAPI api3
```

## Start Locally Or On A VPS

Before starting the containers, run the latest `backend/supabase_schema.sql` in the Supabase SQL editor. The load-balanced backend uses Supabase for shared chat sessions, OTP codes, trial usage, documents, and learned user preferences.

From the repository root:

```bash
docker compose -f docker-compose.loadbalancer.yml up --build -d
```

Then test:

```txt
http://localhost/api/health
```

## Vercel Environment Variable

Point the frontend to the load balancer URL:

```env
VITE_API_URL=https://your-backend-domain.com
```

Do not include `/api` at the end.

## Production Notes

Use a managed database and external vector store for multi-instance production. Supabase is already external, and Chroma Cloud should be used instead of a local `VECTOR_DB_PATH` when several backend containers are running.

Recommended backend env values for multiple instances:

```env
CHROMA_HOST=api.trychroma.com
CHROMA_API_KEY=your_chroma_key
CHROMA_TENANT=your_tenant
CHROMA_DATABASE=nova
DEBUG=False
```

For HTTPS, put this stack behind a cloud provider load balancer, Caddy, Traefik, or Certbot-managed Nginx on the host.
