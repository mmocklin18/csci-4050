import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# create a base class that all models will inherit from
Base = declarative_base()


#Get connection strings from env
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SSL_CA = os.getenv("DB_SSL_CA")

#form db url
DATABASE_URL = (
    f"mysql+asyncmy://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    f"?ssl_ca={DB_SSL_CA}"
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
