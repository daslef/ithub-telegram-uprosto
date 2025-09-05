from random import choice
from peewee import IntegrityError

from .models.company import CompanyRecord
from .models.lottery import LotteryRecord


def seed_lottery_records():
    slots_by_date = {
        "2025-09-06": ["13:50:00", "15:50:00", "16:50:00"],
        "2025-09-07": ["13:50:00", "15:50:00"],
    }

    try:
        for ix in range(20):
            username = f"testuser_{ix}"
            date = choice(list(slots_by_date.keys()))
            time = choice(slots_by_date[date])
            first_name = "testuser"
            last_name = str(ix)
            phone_number = ""
            LotteryRecord.add(username, date, time, first_name, last_name, phone_number)

    except IntegrityError:
        print("Lottery records already exists")


def test_add_company_record(username: str, company_id: str):
    return CompanyRecord.add(username, company_id)


def test_all_company_records():
    return CompanyRecord.get_all()


def test_company_records_by_username(username: str):
    return CompanyRecord.get_by_username(username)


def test_add_lottery_record(username: str, date: str, time: str):
    return LotteryRecord.add(username, date, time)


def test_grouped_lottery_records():
    return LotteryRecord.get_all()


print(test_add_lottery_record("test-1", "2025-09-06", "15:50:00"))
print(test_add_lottery_record("test-2", "2025-09-07", "13:50:00"))
print(test_grouped_lottery_records())

print(test_add_company_record("test-1", "category_1_item_1"))
print(test_add_company_record("test-1", "category_1_item_2"))
print(test_add_company_record("test-1", "category_2_item_3"))
print(test_add_company_record("test-2", "category_3_item_4"))
print(test_company_records_by_username("test-2"))
print(test_all_company_records())
