from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_SSL_CA: str

    # App
    DEBUG: bool = False
    PROJECT_NAME: str = "Cinema Booking App"
    
    # Auth / JWT
    JWT_SECRET: str
    JWT_ALGO: str = "HS256"
    JWT_EXPIRES_MINS: int = 30

    # Email / verification
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    SMTP_VALIDATE_CERTS: bool = True
    EMAIL_FROM: str | None = None
    EMAIL_FROM_NAME: str | None = None
    APP_BASE_URL: str = "http://localhost:8000"
    VERIFICATION_BASE_URL: str | None = None
    VERIFICATION_TTL_HOURS: int = 24
    PASSWORD_RESET_BASE_URL: str | None = None
    PASSWORD_RESET_TTL_HOURS: int = 1

    class Config:
        env_file = ".env"

# create settings object to import anywhere
settings = Settings()
