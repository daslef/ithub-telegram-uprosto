from database.models.company import CompanyRecord


def save_puzzle_results(username, results, credentials={}):
    try:
        CompanyRecord.add_many(
            username,
            [
                company_id
                for category_values in results.values()
                for company_id in category_values["items"]
            ],
            credentials,
        )
    except Exception as e:
        print(e)
