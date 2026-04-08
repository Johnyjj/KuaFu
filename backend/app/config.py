from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 480
    cors_origins: list[str] = ["http://localhost:5173"]

settings = Settings()
