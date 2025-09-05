import pathlib
import json
from peewee import IntegrityError
from .models.company import CompanyCategory, Company, CompanyRecord
from .models.lottery import LotterySlot, LotteryRecord

from .instance import database_instance


def seed_lottery():
    slots_by_date = {
        "2025-09-06": ["13:50:00", "15:50:00", "16:50:00"],
        "2025-09-07": ["13:50:00", "15:50:00"],
    }

    try:
        with database_instance:
            database_instance.drop_tables([LotterySlot])
            database_instance.create_tables([LotterySlot, LotteryRecord])

        for date, times in slots_by_date.items():
            for time in times:
                LotterySlot.create(date=date, time=time)

    except IntegrityError:
        print("Slots data already exists")


def seed_companies():
    def get_data():
        try:
            data_path = pathlib.Path(__file__).resolve().parents[2] / "data.json"
            with data_path.open(encoding="utf8") as data_file:
                return json.load(data_file)
        except Exception as e:
            print(e)
            return {}

    with database_instance:
        database_instance.create_tables(
            [
                CompanyCategory,
                Company,
                CompanyRecord,
            ]
        )

    data = get_data()

    try:
        for category in data:
            row_category = CompanyCategory.create(
                id=category["id"], name=category["category"]
            )

            for item in category["items"]:
                Company.create(
                    id=item["id"],
                    name=item["title"],
                    address=item["address"],
                    website=item["website"],
                    vk=item["vk"],
                    description=item["description"],
                    category=row_category,
                ).save()

    except IntegrityError as e:
        print(e)


seed_lottery()
seed_companies()
