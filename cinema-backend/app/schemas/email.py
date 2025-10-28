from pydantic import BaseModel, EmailStr


class VerificationEmailRequest(BaseModel):
    user_id: int
    email: EmailStr | None = None
