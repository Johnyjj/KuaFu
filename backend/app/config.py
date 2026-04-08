from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 480

    class Config:
        env_file = ".env"

settings = Settings()
