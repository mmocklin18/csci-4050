from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Final
from urllib.parse import urlencode

from app.core.config import settings

_HMAC_SECRET: Final[bytes] = settings.JWT_SECRET.encode("utf-8")


@dataclass(slots=True)
class VerificationParams:
    uid: int
    ts: int
    sig: str
    purpose: str = "verify"


def _signature(user_id: int, email: str, timestamp: int, purpose: str) -> str:
    payload = f"{user_id}:{email}:{timestamp}:{purpose}".encode("utf-8")
    return hmac.new(_HMAC_SECRET, payload, hashlib.sha256).hexdigest()


def _generate_link(
    user_id: int,
    email: str,
    *,
    purpose: str,
    base_url: str,
) -> tuple[str, VerificationParams]:
    issued_at = datetime.now(timezone.utc)
    timestamp = int(issued_at.timestamp())
    signature = _signature(user_id, email, timestamp, purpose)

    params = VerificationParams(uid=user_id, ts=timestamp, sig=signature, purpose=purpose)
    query = urlencode(
        {"uid": params.uid, "ts": params.ts, "sig": params.sig, "purpose": params.purpose}
    )
    return f"{base_url}?{query}", params


def generate_verification_link(user_id: int, email: str) -> tuple[str, VerificationParams]:
    base_url = settings.VERIFICATION_BASE_URL or f"{settings.APP_BASE_URL.rstrip('/')}/auth/verify"
    return _generate_link(user_id, email, purpose="verify", base_url=base_url)


def generate_password_reset_link(user_id: int, email: str) -> tuple[str, VerificationParams]:
    base_url = settings.PASSWORD_RESET_BASE_URL or f"{settings.APP_BASE_URL.rstrip('/')}/reset-password"
    return _generate_link(user_id, email, purpose="password_reset", base_url=base_url)


def validate_verification_params(
    params: VerificationParams,
    *,
    email: str,
    expected_purpose: str = "verify",
    ttl_hours: int | None = None,
) -> None:
    if params.purpose != expected_purpose:
        raise ValueError("Invalid or mismatched link purpose")

    expected_sig = _signature(params.uid, email, params.ts, params.purpose)
    if not hmac.compare_digest(params.sig, expected_sig):
        raise ValueError("Invalid verification link signature")

    issued_at = datetime.fromtimestamp(params.ts, tz=timezone.utc)
    ttl = ttl_hours if ttl_hours is not None else settings.VERIFICATION_TTL_HOURS
    expires_at = issued_at + timedelta(hours=ttl)
    if datetime.now(timezone.utc) > expires_at:
        raise ValueError("Verification link has expired")
