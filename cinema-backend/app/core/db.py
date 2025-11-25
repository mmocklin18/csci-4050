from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# create a base class that all models will inherit from
Base = declarative_base()

#form db url
DATABASE_URL = (
    f"mysql+asyncmy://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)


#Create the async engine that manages connection pool
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

#session factory used to create session objects
async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

#dependency to start a new db session
async def get_session():
    async with async_session() as session:
        yield session
