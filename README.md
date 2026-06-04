# Sentinel Red AI

Production-ready AI red-team and guardrail testing platform built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI components, FastAPI, PostgreSQL/Neon, ChromaDB, LangGraph-compatible workflow architecture, RAGAS-style evaluation metrics, JWT auth, encrypted API key storage, PDF/DOCX reports, audit logs, and deployment-ready config.

## Apps

- `frontend/`: Next.js 15 App Router SaaS UI for authentication, dashboards, red-team tests, attack library, reports, admin, theme persistence, command palette, toasts, responsive layouts, and charts.
- `backend/`: FastAPI API for JWT authentication, RBAC, encrypted key vault, attack library, red-team workflow, RAG security knowledge base, risk scoring, report generation, analytics, and audit trails.

## Quick Start

```bash
npm install
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
copy frontend\.env.example frontend\.env.local
copy backend\.env.example backend\.env
npm run backend:dev
npm run dev
```

Default seeded admin:

- Email: `admin@sentinel.dev`
- Password: `AdminPass123!`

## Environment

Frontend:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

Backend:

```env
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
FERNET_KEY=generate-with-python-cryptography-fernet
CHROMA_PATH=./chroma
REPORT_BASE_URL=https://your-api.railway.app
RATE_LIMIT=120/minute
```

Generate `FERNET_KEY`:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Architecture

```mermaid
flowchart LR
  UI["Next.js App Router UI"] --> API["FastAPI REST API"]
  API --> Auth["JWT + RBAC"]
  API --> DB["Neon PostgreSQL"]
  API --> Vault["Encrypted API Key Vault"]
  API --> Agents["LangGraph-style Multi-Agent Workflow"]
  Agents --> RAG["ChromaDB Security RAG"]
  Agents --> Risk["Risk + RAGAS Metrics"]
  Risk --> Reports["PDF/DOCX Reports"]
```

## Deployment

Vercel frontend:

1. Set project root to `frontend`.
2. Add `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL`.
3. Deploy with the included `vercel.json`.

Railway/Render backend:

1. Set root to `backend`.
2. Add variables from `backend/.env.example`.
3. Use `uvicorn app.main:app --host 0.0.0.0 --port $PORT` or the included `Procfile`.
4. Point `DATABASE_URL` at Neon PostgreSQL.

## Screenshots

Add screenshots after first deployment:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/tests.png`
- `docs/screenshots/library.png`
- `docs/screenshots/admin.png`

## Security Features

- Password hashing with bcrypt.
- JWT bearer authentication.
- User, researcher, and admin RBAC.
- Encrypted provider API key storage with Fernet.
- Prompt injection marker detection.
- Request rate limiting.
- CORS locked to configured frontend origin.
- SQLAlchemy models with parameterized queries.
- Audit trails for auth, tests, and key vault changes.
- Environment-based secrets and production deployment config.
