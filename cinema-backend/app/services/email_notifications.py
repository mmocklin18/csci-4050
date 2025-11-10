from datetime import date

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
    if fields_changed:
        change_lines = "\n".join(f"- {field}" for field in fields_changed)
        changes_section = (
            "We wanted to let you know that the following details on your profile were updated:\n"
            f"{change_lines}\n\n"
        )
    else:
        changes_section = "We wanted to let you know that your Cinema Booking profile was updated.\n\n"

    body = (
        f"{greeting}\n\n"
        f"{changes_section}"
        "If you made this change, no further action is required.\n"
        "If you did not update your profile, please reset your password immediately or contact support.\n\n"
        "Thanks,\n"
        "Cinema Booking Team"
    )

    await send_email(
        "Your Cinema Booking profile was updated",
        email,
        body,
    )


def queue_payment_method_email(
    background_tasks: BackgroundTasks,
    *,
    email: str,
    first_name: str | None,
    last_four: str,
    action: str,
) -> None:
    background_tasks.add_task(
        send_payment_method_email,
        email,
        first_name,
        last_four,
        action,
    )


async def send_payment_method_email(
    email: str,
    first_name: str | None,
    last_four: str,
    action: str,
) -> None:
    greeting = f"Hi {first_name}," if first_name else "Hello,"
    body = (
        f"{greeting}\n\n"
        f"A payment method ending in ****{last_four} was {action} on your Cinema Booking account.\n"
        "If you made this change, no further action is required.\n"
        "If you did not update your payment details, please contact support immediately.\n\n"
        "Thanks,\n"
        "Cinema Booking Team"
    )

    await send_email(
        "Your Cinema Booking payment method changed",
        email,
        body,
    )


def queue_promotion_email(
    background_tasks: BackgroundTasks,
    *,
    email: str,
    first_name: str | None,
    code: str,
    discount: int,
    start_date: date | None,
    end_date: date | None,
) -> None:
    background_tasks.add_task(
        send_promotion_email,
        email,
        first_name,
        code,
        discount,
        start_date,
        end_date,
    )


async def send_promotion_email(
    email: str,
    first_name: str | None,
    code: str,
    discount: int,
    start_date: date | None,
    end_date: date | None,
) -> None:
    greeting = f"Hi {first_name}," if first_name else "Hello,"

    if start_date or end_date:
        start_text = start_date.strftime("%B %d, %Y") if start_date else "now"
        end_text = (
            end_date.strftime("%B %d, %Y") if end_date else "further notice"
        )
        window = f"This offer runs from {start_text} through {end_text}."
    else:
        window = "This offer is available for a limited time."

    body = (
        f"{greeting}\n\n"
        f"We have a new promotion just for you! Use code {code} to save {discount}% on your next booking.\n"
        f"{window}\n\n"
        "Log in to Cinema Booking to apply the code at checkout.\n\n"
        "Thanks for being part of our community!\n"
        "Cinema Booking Team"
    )

    await send_email(
        "New Cinema Booking promotion",
        email,
        body,
    )
