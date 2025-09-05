import datetime
from peewee import (
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegrityError,
)
from ._base import BaseModel
from .company import CompanyCategory


class CommentRecord(BaseModel):
    username = CharField()
    first_name = CharField()
    last_name = CharField()
    phone_number = CharField()
    comment = CharField()
    category = ForeignKeyField(CompanyCategory, backref="comments")
    created_at = DateTimeField()

    def add_many(
        username: str, comments: list[tuple[str, str]], credentials: dict[str, str]
    ):
        try:
            rows_to_insert = [
                {
                    "category": CompanyCategory.get_by_id(category),
                    "username": username,
                    "created_at": datetime.datetime.now(),
                    "first_name": credentials.get("first_name", ""),
                    "last_name": credentials.get("last_name", ""),
                    "phone_number": credentials.get("phone_number", ""),
                    "comment": comment,
                }
                for category, comment in comments
            ]

            return CommentRecord.insert_many(rows_to_insert).execute()

        except IntegrityError:
            print("Record already exists")

        except Exception as e:
            print(e)

    def get_all():
        try:
            return list(
                CommentRecord.select(
                    CommentRecord.username,
                    CommentRecord.first_name,
                    CommentRecord.last_name,
                    CommentRecord.phone_number,
                    CompanyCategory.name.alias("category"),
                    CommentRecord.comment,
                    CommentRecord.created_at,
                )
                .join(CompanyCategory)
                .order_by(CommentRecord.created_at)
                .dicts()
            )
        except Exception as e:
            print(e)
