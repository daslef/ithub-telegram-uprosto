from database.models.lottery import LotteryRecord


def save_lottery_results(username, results):
    try:
        date = results.get("date")
        time = results.get("time")
        first_name = results.get("first_name")
        last_name = results.get("last_name")
        phone_number = results.get("phone_number")

        if not date or not time:
            print(f"Ошибка: date или time отсутствует в payload для {username}")
            return

        existing = LotteryRecord.get_or_none(LotteryRecord.username == username)

        if existing:
            LotteryRecord.update_slot(username, date, time)
        else:
            LotteryRecord.add(
                username=username,
                date=date,
                time=time,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
            )

    except Exception as e:
        print(f"Ошибка при сохранении регистрации для {username}: {e}")
