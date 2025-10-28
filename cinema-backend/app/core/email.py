import logging
from functools import lru_cache
from typing import Optional

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema

from app.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_mailer() -> Optional[FastMail]:
    """Return a cached FastMail instance if configuration is complete."""
    if not settings.SMTP_HOST or not settings.EMAIL_FROM:
        return None

    try:
        conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USERNAME,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=settings.EMAIL_FROM,
            MAIL_FROM_NAME=settings.EMAIL_FROM_NAME,
            MAIL_SERVER=settings.SMTP_HOST,
            MAIL_PORT=settings.SMTP_PORT or 25,
            MAIL_STARTTLS=settings.SMTP_USE_TLS,
            MAIL_SSL_TLS=settings.SMTP_USE_SSL,
            USE_CREDENTIALS=bool(settings.SMTP_USERNAME or settings.SMTP_PASSWORD),
            VALIDATE_CERTS=settings.SMTP_VALIDATE_CERTS,
            SUPPRESS_SEND=False,
        )
        return FastMail(conf)
    except Exception as exc:
        logger.error("Failed to initialize email configuration: %s", exc)
        return None


async def send_email(subject: str, to_email: str, body: str, *, html: bool = False) -> None:
    """
    Send an email using FastAPI-Mail.

    When configuration is missing, log the message so local development can continue.
    """
    mailer = _get_mailer()
    if not mailer:
        logger.warning(
            "Email configuration incomplete; skipped sending email to %s. Subject: %s",
            to_email,
            subject,
        )
        logger.debug("Email body: %s", body)
        return

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=body,
        subtype="html" if html else "plain",
    )

    try:
        await mailer.send_message(message, template_name=None)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
