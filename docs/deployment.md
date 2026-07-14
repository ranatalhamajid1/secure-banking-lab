# SecureBank – Deployment Guide

## Environment Separation

| Environment | Database          | Frontend      | Backend             | Purpose           |
|------------|-------------------|---------------|---------------------|-------------------|
| Development| Docker (local)    | Vite dev      | Nodemon             | Local development |
| Staging    | MongoDB Atlas     | Vercel Preview| Railway/Render      | Pre-release QA    |
| Production | MongoDB Atlas     | Vercel        | Railway/Render/AWS  | Live users        |

## Local Development (Docker)

```bash
# Start everything with one command
docker compose up -d

# Services available:
# Frontend:      http://localhost:80
# Backend API:   http://localhost:5000
# Mongo Express: http://localhost:8081
# MongoDB:       localhost:27017
```

## Local Development (Manual)

```bash
# Terminal 1 – Backend
cd server
npm install
npm run dev

# Terminal 2 – Frontend
cd client
npm install
npm run dev
```

## Production Deployment

### Infrastructure Architecture

```mermaid
graph LR
    U[Users] -->|HTTPS| CF[Cloudflare CDN]
    CF -->|Proxy| V[Vercel - Frontend]
    CF -->|API| R[Railway - Backend]
    R -->|TLS| MA[MongoDB Atlas]
    
    GA[GitHub Actions] -->|Deploy| V
    GA -->|Deploy| R
```

### Environment Variables

**Backend (Production)**
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/banking-lab
JWT_SECRET=<strong-random-256bit-secret>
NODE_ENV=production
ENCRYPTION_KEY=<strong-random-256bit-hex>
```

### Rollback Strategy

1. **Automatic**: GitHub Actions deploys from `main` branch only
2. **Manual**: Revert commit on `main` → triggers automatic redeploy
3. **Database**: MongoDB Atlas provides point-in-time recovery (PITR)
4. **Frontend**: Vercel maintains deployment history with instant rollback

### Secrets Management

| Secret          | Storage                | Rotation    |
|----------------|------------------------|-------------|
| JWT_SECRET     | Platform env vars      | Quarterly   |
| MONGO_URI      | Platform env vars      | On breach   |
| ENCRYPTION_KEY | Platform env vars      | Quarterly   |
| API Keys       | GitHub Secrets (CI)    | On breach   |

> **Never** commit `.env` files. Use platform-native secret management.
