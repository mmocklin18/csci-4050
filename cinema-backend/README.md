

## How to start backend locally

### 1) Clone repo

```bash
git clone <your-repo-url>
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





