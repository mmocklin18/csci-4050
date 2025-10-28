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

    # Encryption
    ENCRYPTION_KEY: str  

    class Config:
        env_file = ".env"

# create settings object to import anywhere
settings = Settings()