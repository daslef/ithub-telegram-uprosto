from peewee import Model
from database.instance import database_instance


class BaseModel(Model):
    class Meta:
        database = database_instance
        legacy_table_names = False
