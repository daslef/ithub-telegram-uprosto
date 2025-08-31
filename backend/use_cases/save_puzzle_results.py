import json
from database.models.company import CompanyRecord


def save_puzzle_results(username, results, phone=None):
    try:
        data = json.loads(results)

        CompanyRecord.add_many(
            username,
            [
                company_id
                for category_values in data.values()
                for company_id in category_values["items"]
            ],
            phone=phone 
        )
    except Exception as e:
        print(e)

 