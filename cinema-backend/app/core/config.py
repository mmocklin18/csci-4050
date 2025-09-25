from pathlib import Path
import re
from typing import Optional

ENV_FILE = Path(".env")

def _read_env_text() -> str:
    if not ENV_FILE.exists():
        return ""
    txt = ENV_FILE.read_text(errors="ignore")
    if txt.lstrip().startswith("{\\rtf"):
        txt = re.sub(r"\\[a-zA-Z]+(?:-?\d+)? ?|[{}]", " ", txt)
    return txt

def _get(k: str, text: str) -> Optional[str]:
    # robust KEY=VALUE extraction across weird spacing/line breaks
    m = re.search(rf"\b{k}\s*=\s*([^\s\\]+)", text)
    return m.group(1).strip() if m else None

_env_text = _read_env_text()

DB_HOST = _get("DB_HOST", _env_text)
DB_PORT = int(_get("DB_PORT", _env_text) or 3306)
DB_NAME = _get("DB_NAME", _env_text)
DB_USER = _get("DB_USER", _env_text)
DB_PASSWORD = _get("DB_PASSWORD", _env_text)
DB_SSL_CA = _get("DB_SSL_CA", _env_text)

def resolve_ca_path() -> Optional[str]:
    # 1) use the provided path if it exists
    if DB_SSL_CA and Path(DB_SSL_CA).exists():
        return DB_SSL_CA
    # 2) try common local locations (no file edits needed)
    for p in [Path("ca.pem"), Path("certs/aiven-ca.pem")]:
        if p.exists():
            return str(p)
    return None

CA_PATH = resolve_ca_path()

API_PORT = int(_get("API_PORT", _env_text) or 4000)
CORS_ORIGINS = _get("CORS_ORIGINS", _env_text) or "http://localhost:3000"
CORS_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]