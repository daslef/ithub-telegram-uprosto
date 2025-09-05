import asyncio
import logging
import json
import datetime

from aiogram import Bot, Dispatcher, types, F
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from aiogram.utils.formatting import Text, Bold
from aiogram.enums.content_type import ContentType
from aiogram.enums.parse_mode import ParseMode
from aiogram.filters import CommandStart

from config import settings
from use_cases.save_puzzle_results import save_puzzle_results
from use_cases.save_lottery_results import save_lottery_results
from use_cases.lottery_report import show_lottery_report, send_lottery_report
from use_cases.companies_report import (
    send_users_answers_report,
    send_companies_brochure,
)

logging.basicConfig(level=logging.WARN)

bot = Bot(settings.bot_token)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    webAppInfo = types.WebAppInfo(url=settings.webapp_url)
    builder = ReplyKeyboardBuilder()
    builder.row(
        types.KeyboardButton(text="Открыть приложение", web_app=webAppInfo),
    )

    if message.from_user.id in settings.admins:
        builder.row(
            types.KeyboardButton(text="Регистрации на розыгрыш"),
            types.KeyboardButton(text="Регистрации на розыгрыш (XLSX)"),
        )
        builder.row(
            types.KeyboardButton(text="Пользовательские отклики (XLSX)"),
        )

    await message.answer(
        text=Text(
            f"Привет, {message.from_user.first_name}! Я бот для навигации по фестивалю. Здесь ты можешь увидеть карту фестиваля, а также принять участие в игре!"
        ).as_markdown(),
        reply_markup=builder.as_markup(resize_keyboard=True),
        parse_mode=ParseMode.MARKDOWN_V2,
    )


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def parse_data(message: types.Message):
    username = message.from_user.username or f"id{message.from_user.id}"

    try:
        raw = json.loads(message.web_app_data.data)
        data_type = raw.get("type")
        payload = raw.get("payload")

        if not data_type or not payload:
            raise Exception("Ошибка формата данных")

        if data_type == "puzzle":
            credentials = raw.get("credentials", {})
            save_puzzle_results(username, payload, credentials)

            filename = f"{username}_brochure_{datetime.datetime.now().isoformat(timespec='minutes')}.pdf"
            await message.answer_document(
                types.BufferedInputFile(
                    file=send_companies_brochure(username), filename=filename
                )
            )

            content = Text(
                "В этом документе представлена ",
                Bold("информация о заинтересовавших вас организациях"),
                "! А если хотите принять участие в ",
                Bold("розыгрыше призов"),
                " - возвращайтесь в приложение и выбирайте удобное Вам время!",
            )

            await message.answer(**content.as_kwargs())

        elif data_type == "lottery":
            save_lottery_results(username, payload)
            await message.answer(
                f"Заявка принята! Вы зарегистрированы на {payload['date'].split('-')[-1]} сентября, {payload['time']}"
            )
        else:
            raise Exception("Ошибка формата данных")

    except Exception as e:
        logging.exception(e)
        await message.answer(
            "Приносим извинения за технические неполадки. Попробуйте позже"
        )


@dp.message(
    (F.text == "Регистрации на розыгрыш") & (F.from_user.id.in_(settings.admins))
)
async def show_report_lottery_message(message: types.Message):
    await message.answer(text=show_lottery_report(), parse_mode=ParseMode.HTML)


@dp.message(
    (F.text == "Регистрации на розыгрыш (XLSX)") & (F.from_user.id.in_(settings.admins))
)
async def send_report_lottery_message(message: types.Message):
    filename = f"lottery_{datetime.datetime.now().isoformat(timespec='minutes')}.xlsx"
    await message.answer_document(
        types.BufferedInputFile(file=send_lottery_report(), filename=filename)
    )


@dp.message(
    (F.text == "Пользовательские отклики (XLSX)")
    & (F.from_user.id.in_(settings.admins))
)
async def send_users_answers_report_message(message: types.Message):
    puzzle_filename = (
        f"puzzle_{datetime.datetime.now().isoformat(timespec='minutes')}.xlsx"
    )
    comments_filename = (
        f"comments_{datetime.datetime.now().isoformat(timespec='minutes')}.xlsx"
    )
    await message.answer_document(
        types.BufferedInputFile(
            file=send_users_answers_report("companies"), filename=puzzle_filename
        )
    )
    await message.answer_document(
        types.BufferedInputFile(
            file=send_users_answers_report("comments"), filename=comments_filename
        )
    )


async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
