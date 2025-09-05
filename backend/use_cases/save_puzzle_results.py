from database.models.company import CompanyRecord
from database.models.comment import CommentRecord


def save_puzzle_results(username, results, credentials):
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

    try:
        CommentRecord.add_many(
            username,
            [
                (category, results[category]["comment"])
                for category in results
                if results[category]["comment"]
                and len(results[category]["comment"]) > 0
            ],
            credentials,
        )
    except Exception as e:
        print(e)
