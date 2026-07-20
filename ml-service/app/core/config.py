from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Canopy ML Service"
    debug: bool = True
    mongodb_uri: str = "mongodb://localhost:27017/canopy"
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


settings = Settings()
