import asyncio
import logging
import json
import datetime

from aiogram import Bot, Dispatcher, types, F
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from aiogram.enums.content_type import ContentType
from aiogram.filters import CommandStart
from aiogram.enums.parse_mode import ParseMode

from config import settings
from database.models.company import CompanyRecord
from use_cases.save_puzzle_results import save_puzzle_results
from use_cases.save_lottery_results import save_lottery_results
from use_cases.lottery_report import show_lottery_report, send_lottery_report
from use_cases.companies_report import send_users_answers_report, send_companies_brochure

logging.basicConfig(level=logging.INFO)

bot = Bot(settings.bot_token)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    webAppInfo = types.WebAppInfo(url=settings.webapp_url)
    builder = ReplyKeyboardBuilder()
    builder.row(
        types.KeyboardButton(text="Принять участие в игре", web_app=webAppInfo),
        types.KeyboardButton(text="Посмотреть карту фестиваля"),
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
        text=f"Привет, {message.from_user.first_name}! Я бот для навигации по фестивалю. Здесь ты можешь увидеть карту фестиваля, а также принять участие в игре!",
        reply_markup=builder.as_markup(resize_keyboard=True),
    )


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def parse_data(message: types.Message):
    username = message.from_user.username or f"id{message.from_user.id}"

    try:
        raw = json.loads(message.web_app_data.data)
        data_type = raw.get("type")
        payload = raw.get("payload")
        consent = raw.get("consent") 
        phone = raw.get("phone") if consent else None 

        if not data_type or not payload:
            await message.answer("ошибка формата данных.")
            return

        if data_type == "puzzle":
            save_puzzle_results(username, payload, phone=phone)

            filename = f"{username}_brochure_{datetime.datetime.now().isoformat(timespec='minutes')}.pdf"
            await message.answer_document(
                types.BufferedInputFile(
                    file=send_companies_brochure(username),
                    filename=filename
                )
            )

        elif data_type == "lottery":
            save_lottery_results(username, payload)
            await message.answer("Регистрация на розыгрыш сохранена или обновлена! B)")

        else:
            await message.answer("ошибка формата данных.")

    except Exception as e:
        logging.exception(e)
        await message.answer(
            "Приносим извинения за технические неполадки. Попробуйте позже"
        )


@dp.message(F.text == "Регистрации на розыгрыш")
async def show_report_lottery_message(message: types.Message):
    await message.answer(text=show_lottery_report(), parse_mode=ParseMode.HTML)


@dp.message(F.text == "Регистрации на розыгрыш (XLSX)")
async def send_report_lottery_message(message: types.Message):
    filename = f"lottery_{datetime.datetime.now().isoformat(timespec='minutes')}.xlsx"
    await message.answer_document(
        types.BufferedInputFile(file=send_lottery_report(), filename=filename)
    )


@dp.message(F.text == "Пользовательские отклики (XLSX)")
async def send_users_answers_report_message(message: types.Message):
    filename = f"puzzle_{datetime.datetime.now().isoformat(timespec='minutes')}.xlsx"
    await message.answer_document(
        types.BufferedInputFile(file=send_users_answers_report(), filename=filename)
    )


@dp.message(F.text == "Посмотреть карту фестиваля")
async def show_map(message: types.Message):
    await message.answer_photo(types.FSInputFile(path="./festival_map.jpg"))


async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
