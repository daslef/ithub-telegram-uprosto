from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bot_token: str
    webapp_url: str
    debug_mode: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
