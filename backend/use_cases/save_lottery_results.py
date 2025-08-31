import json
from database.models.lottery import LotteryRecord


def save_lottery_results(username, results):
    try:
        data = results if isinstance(results, dict) else json.loads(results)
        date = data.get("date")
        time = data.get("time")

        if not date or not time:
            print(f"Ошибка: date или time отсутствует в payload для {username}")
            return

        existing = LotteryRecord.get_by_username(username)
        if existing:
            existing.date = date
            existing.time = time
            existing.save()
        else:
            LotteryRecord.add(username=username, date=date, time=time)

    except Exception as e:
        print(f"Ошибка при сохранении регистрации для {username}: {e}")
