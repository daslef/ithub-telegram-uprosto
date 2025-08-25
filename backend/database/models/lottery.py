import datetime
from peewee import CharField, DateField, TimeField, DateTimeField, ForeignKeyField
from ._base import BaseModel


class LotterySlot(BaseModel):
    date = DateField()
    time = TimeField()


class LotteryRecord(BaseModel):
    username = CharField()
    slot = ForeignKeyField(LotterySlot, backref="records")
    created_at = DateTimeField()

    def add(username: str, date: str, time: str):
        try:
            row_slot = LotterySlot.get(date=date, time=time)

            if LotteryRecord.get_or_none(username=username):
                return (
                    LotteryRecord.update(slot=row_slot)
                    .where(LotteryRecord.username == username)
                    .execute()
                )

            return LotteryRecord.create(
                username=username,
                slot=row_slot,
                created_at=datetime.datetime.now(),
            )

        except Exception as e:
            print(e)
            print(f"No slot with date {date} and time {time}")

    def get_all():
        try:
            query = (
                LotteryRecord.select(
                    LotteryRecord.username.alias("username"),
                    LotterySlot.date.alias("date"),
                    LotterySlot.time.alias("time"),
                )
                .join(LotterySlot, on=(LotteryRecord.slot_id == LotterySlot.id))
                .order_by(LotterySlot)
                .dicts()
            )
            return list(query)
        except Exception:
            raise
