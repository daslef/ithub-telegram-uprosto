import datetime
from peewee import (
    CharField,
    DateTimeField,
    ForeignKeyField,
    CompositeKey,
    IntegrityError,
)
from ._base import BaseModel


class CompanyCategory(BaseModel):
    id = CharField(unique=True, primary_key=True)
    name = CharField(unique=True)


class Company(BaseModel):
    id = CharField(unique=True, primary_key=True)
    name = CharField(unique=True)
    description = CharField()
    contacts = CharField()
    category = ForeignKeyField(CompanyCategory, backref="companies")


class CompanyRecord(BaseModel):
    username = CharField()
    company = ForeignKeyField(Company, backref="records")
    created_at = DateTimeField()

    class Meta:
        primary_key = CompositeKey("username", "company")

    def add(username: str, company_id: str):
        try:
            row_company = Company.get_by_id(company_id)
            return CompanyRecord.create(
                username=username,
                company=row_company,
                created_at=datetime.datetime.now(),
            )
        except IntegrityError:
            print("Record already exists")

        except Exception:
            print(f"No company with id {company_id}")

    def add_many(username: str, company_ids: list[str]):
        try:
            rows_to_insert = [
                {
                    "company": Company.get_by_id(company_id),
                    "username": username,
                    "created_at": datetime.datetime.now(),
                }
                for company_id in company_ids
            ]
            return CompanyRecord.insert_many(rows_to_insert).execute()

        except IntegrityError:
            print("Record already exists")

        except Exception as e:
            print(e)

    def get_all():
        try:
            return list(
                CompanyRecord.select(
                    Company.name.alias("company"), CompanyRecord.username
                )
                .join(Company)
                .order_by(Company.name)
                .dicts()
            )
        except Exception as e:
            print(e)

    def get_by_username(username: str):
        try:
            return list(
                CompanyRecord.select(
                    Company.name,
                    Company.description,
                    Company.contacts,
                    CompanyCategory.name.alias("category"),
                )
                .join(Company)
                .join(CompanyCategory)
                .where(CompanyRecord.username == username)
                .dicts()
            )
        except Exception as e:
            print(e)
