from fastapi import BackgroundTasks

from app.core.config import settings
from app.core.email import send_email
from app.core.verification import (
    generate_password_reset_link,
    generate_verification_link,
)


def queue_verification_email(
    background_tasks: BackgroundTasks,
    *,
    user_id: int,
    email: str,
    first_name: str | None,
) -> None:
    """
    Schedule a verification email for the given user details.

    BackgroundTasks ensures the response returns immediately while email is sent.
    """
    background_tasks.add_task(
        send_verification_email,
        user_id,
        email,
        first_name,
    )


async def send_verification_email(user_id: int, email: str, first_name: str | None) -> None:
    verification_link, _ = generate_verification_link(user_id, email)
    greeting = f"Hi {first_name}," if first_name else "Hello,"
    body = (
        f"{greeting}\n\n"
        "Welcome to Cinema Booking! Please verify your email address by clicking the link below:\n\n"
        f"{verification_link}\n\n"
        "If you did not create this account, you can ignore this email.\n"
        "Thanks,\n"
        "Cinema Booking Team"
    )
    await send_email(
        "Verify your Cinema Booking account",
        email,
        body,
    )


def queue_password_reset_email(
    background_tasks: BackgroundTasks,
    *,
    user_id: int,
    email: str,
    first_name: str | None,
) -> None:
    background_tasks.add_task(
        send_password_reset_email,
        user_id,
        email,
        first_name,
    )


async def send_password_reset_email(
    user_id: int,
    email: str,
    first_name: str | None,
) -> None:
    reset_link, _ = generate_password_reset_link(user_id, email)
    greeting = f"Hi {first_name}," if first_name else "Hello,"
    ttl_hours = settings.PASSWORD_RESET_TTL_HOURS
    ttl_phrase = (
        f"{ttl_hours} hour" if ttl_hours == 1 else f"{ttl_hours} hours"
    )
    body = (
        f"{greeting}\n\n"
        "We received a request to reset the password for your Cinema Booking account.\n\n"
        "If you made this request, click the link below to choose a new password:\n"
        f"{reset_link}\n\n"
        "If you did not request a password reset, you can safely ignore this email.\n"
        f"The link will expire in {ttl_phrase} for your security.\n\n"
        "Thanks,\n"
        "Cinema Booking Team"
    )
    await send_email(
        "Reset your Cinema Booking password",
        email,
        body,
    )


def queue_profile_update_email(
    background_tasks: BackgroundTasks,
    *,
    email: str,
    first_name: str | None,
    fields_changed: list[str],
) -> None:
    if not fields_changed:
        return
    background_tasks.add_task(
        send_profile_update_email,
        email,
        first_name,
        fields_changed,
    )


async def send_profile_update_email(
    email: str,
    first_name: str | None,
    fields_changed: list[str],
) -> None:
    greeting = f"Hi {first_name}," if first_name else "Hello,"
    changes = ", ".join(fields_changed)
    body = (
        f"{greeting}\n\n"
        "We wanted to let you know that the following details on your Cinema Booking profile were updated:\n"
        f"- {changes}\n\n"
        "If you made these changes, no further action is needed.\n"
        "If you did not make this update, please reset your password immediately or contact support.\n\n"
        "Thanks,\n"
        "Cinema Booking Team"
    )
    await send_email(
        "Your Cinema Booking profile was updated",
        email,
        body,
    )
