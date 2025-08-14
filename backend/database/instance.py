from peewee import SqliteDatabase
from config import settings

database_instance = SqliteDatabase(
    settings.db_path,
    pragmas=(
        ("cache_size", -1024 * 64),
        ("journal_mode", "wal"),
        ("foreign_keys", 1),
    ),
)
