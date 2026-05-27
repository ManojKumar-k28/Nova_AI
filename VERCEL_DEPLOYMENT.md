# Vercel Deployment

This repository is configured so Vercel can deploy the React frontend from the repository root.

## What Vercel Deploys

Vercel builds:

```txt
frontend
```

using the root `vercel.json`:

```txt
Install Command: cd frontend && npm ci
Build Command: cd frontend && npm run build
Output Directory: frontend/dist
```

The FastAPI backend should be hosted separately on a Python-friendly host such as Render, Railway, Fly.io, or a VPS.

## Vercel Project Setup

1. Push this repository to GitHub.
2. Open Vercel and import the repository.
3. Keep the project root as the repository root.
4. Vercel will read `vercel.json` automatically.
5. Add this environment variable in Vercel:

```env
VITE_API_URL=https://your-backend-domain.com
```

Do not add `/api` at the end. The frontend already calls paths like `/api/auth/login`.

## Backend Requirement

Before testing the Vercel frontend, deploy the backend and confirm this URL works:

```txt
https://your-backend-domain.com/api/health
```

## Local Production Check

From the `frontend` directory:

```bash
npm run build
npm run preview
```

