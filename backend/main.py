import asyncio
import logging
import json

from aiogram import Bot, Dispatcher, types, F
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from aiogram.enums.content_type import ContentType
from aiogram.filters import CommandStart
from aiogram.enums.parse_mode import ParseMode

from config import settings

logging.basicConfig(level=logging.INFO)

bot = Bot(settings.bot_token)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    webAppInfo = types.WebAppInfo(url=settings.webapp_url)
    builder = ReplyKeyboardBuilder()
    builder.add(types.KeyboardButton(text="Принять участие в игре", web_app=webAppInfo))
    builder.add(types.KeyboardButton(text="Посмотреть карту фестиваля"))

    await message.answer(
        text=f"Привет, {message.from_user.first_name}! Я бот для навигации по фестивалю. Здесь ты можешь увидеть карту фестиваля, а также принять участие в игре!",
        reply_markup=builder.as_markup(resize_keyboard=True),
    )


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def parse_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    await message.answer(
        f"<b>{data['title']}</b>\n\n<code>{data['desc']}</code>\n\n{data['text']}",
        parse_mode=ParseMode.HTML,
    )


@dp.message(F.text == "Посмотреть карту фестиваля")
async def show_map(message: types.Message):
    await message.answer_photo(types.FSInputFile(path="./festival_map.jpg"))


async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
