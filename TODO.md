# TODO - Production connectivity (Vercel frontend -> Render FastAPI backend)

## Completed
- Updated `frontend/lib/api.ts` to:
  - Prefer `NEXT_PUBLIC_API_URL` and avoid localhost fallback in production
  - Add 15s timeout and safer network/invalid-response error handling
- Updated `backend/app/main.py` CORS to always include local dev origins (3000/3001)
- Updated `backend/app/core/config.py` comments for `report_base_url` (placeholder)
- Added root `render.yaml`

## Remaining (do these before deploying)
1. Edit `backend/app/core/config.py` to add env-driven `report_base_url` + env-driven `frontend_origin` for production (Render).
2. (Recommended) Add Render env vars:
   - `FRONTEND_ORIGIN` = your Vercel frontend URL
   - `REPORT_BASE_URL` = your Render backend URL
3. Ensure backend config is reading the env vars you set (verify env var names match Pydantic settings fields).
4. Deploy backend to Render, copy the backend public URL.
5. Set Vercel env var `NEXT_PUBLIC_API_URL` to the Render backend public URL.
6. Verify:
   - `npm run build` passes (frontend)
   - FastAPI endpoints `/health`, login, dashboard, reports, tests work


