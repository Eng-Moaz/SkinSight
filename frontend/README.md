# SkinSight – Frontend

React (Vite) website for SkinSight. Owner: Marvin (with Ganna).

## Run locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

By default (`.env.development`) the site uses **fake results** (`VITE_USE_MOCK=true`),
so it works without the backend. Different photos give different fake types, so you can
see both the "high risk" and "low risk" layouts.

## Connect to the real prediction service

1. Start the FastAPI service on port 8000.
2. Create `frontend/.env.local` with:
   ```
   VITE_USE_MOCK=false
   ```
3. `npm run dev` – requests to `/api/predict` are proxied to `http://localhost:8000/predict`.

The site sends `POST /predict` as `multipart/form-data` with the image in a field named
**`file`**. The FastAPI parameter must be called `file` (tell Ganna). Expected answer:

```json
{ "top_type": "Melanoma", "confidence": 0.81, "risk": "high",
  "all_types": { "Melanoma": 0.81, "Melanocytic nevus": 0.05, "...": 0.0 } }
```

For production, route `/api/*` on the load balancer to the prediction service (path
`/api` stripped), or set `VITE_API_URL` at build time.

## Structure

```
src/
  App.jsx            routes + shared state (photo + result)
  api.js             validation (image only, max 10 MB), predict call, mock mode
  lesions.js         the 7 types: risk + short description (Salma will refine the texts)
  components/        Layout, Disclaimer, Loader, ErrorBox, RiskBadge, ProbabilityBars
  pages/             Home, Upload, Result, About, NotFound
  styles.css         all styling (mobile first)
```

## Notes

- The "student project, not a medical diagnosis" message appears in the top bar, the footer,
  the upload page, the result page and the About page.
- If the model's top confidence is below 50% the result page shows an extra caution note.
- `/result` opened directly (or after a refresh) redirects to `/upload`, because the result
  is kept in memory only (no photos are stored).
- A static host needs a fallback to `index.html` for unknown paths (needed for React Router);
  tell Moaz when he writes the frontend Dockerfile / nginx config.
