

## How to start backend locally

### 1) Clone repo

```bash
git clone https://github.com/mmocklin18/csci-4050
cd cinema-backend
```

### 2) Create/ activate virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies
```bash
pip install -r requirements.txt
```

### 4) Run the FastAPI server (from project root)
```bash
uvicorn app.main:app --reload
```

### Interactive API Documentation
- Swagger UI → [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
- ReDoc → [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)  

### Email verification
- Verification emails are delivered with [`fastapi-mail`](https://github.com/sabuhish/fastapi-mail).
- Set these environment variables in `.env` to enable delivery:
  - `SMTP_HOST`, `SMTP_PORT`
  - `SMTP_USERNAME`, `SMTP_PASSWORD`
  - `SMTP_USE_TLS` (default `True`), `SMTP_USE_SSL` (default `False`)
  - `SMTP_VALIDATE_CERTS` (default `True`)
  - `EMAIL_FROM` and optional `EMAIL_FROM_NAME`
  - `APP_BASE_URL` (defaults to `http://localhost:8000`) and optional `VERIFICATION_BASE_URL`
  - `PASSWORD_RESET_BASE_URL` (defaults to `{APP_BASE_URL}/reset-password`)
  - `VERIFICATION_TTL_HOURS` (default `24`)
  - `PASSWORD_RESET_TTL_HOURS` (default `1`)
- Without SMTP configuration, the backend logs the skipped email—including its body—for local testing.
- `POST /auth/signup` now returns a 201 with `{"message": "Account created...", "user_id": <id>}` so the frontend can prompt users to verify before logging in. Use `POST /email/verification` (body: `{"user_id": 1}`) to resend the same message on demand.
- Password recovery workflow:
  - `POST /auth/forgot-password` accepts `{ "email": "user@example.com" }` and always responds with 202 to avoid leaking account existence.
  - The backend emails a signed link (uid, timestamp, signature, purpose) to `PASSWORD_RESET_BASE_URL`.
  - `POST /auth/reset-password` consumes `{ uid, ts, sig, purpose, password }` from that link to update the credential.
- Profile updates trigger an email notification summarising changed fields once `/user` `PATCH` succeeds.

### Project structure
```bash
cinema-backend/
│── app/
│   ├── core/            # config, db, security, dependencies
│   ├── models/          # SQLAlchemy models (DB tables)
│   ├── routers/         # API routes (users, movies, bookings…)
│   ├── schemas/         # Pydantic schemas (request/response models)
│   └── main.py          # FastAPI entrypoint
│── requirements.txt     # dependencies
│── .env                 # environment variables (ignored in git)
│── README.md            # project docs
```
