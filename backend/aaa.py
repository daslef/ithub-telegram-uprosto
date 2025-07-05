from telegram import Bot, Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
import os

# Токен бота
TOKEN = '8140513380:AAHTFVRAMc-38YiCBVk13yD4VMITTmIhwaU'
# Путь к изображению карты фестиваля
FESTIVAL_MAP_PATH = "festival_map.png"  # Убедитесь, что файл существует

def start(update: Update, context: CallbackContext) -> None:
    """Отправляет приветственное сообщение и клавиатуру с кнопкой"""
    keyboard = [[KeyboardButton("Карта фестиваля")]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    update.message.reply_text(
        'Добро пожаловать! Нажмите кнопку ниже, чтобы получить карту фестиваля.',
        reply_markup=reply_markup
    )

def send_festival_map(update: Update, context: CallbackContext) -> None:
    """Отправляет карту фестиваля"""
    chat_id = update.message.chat_id
    
    if os.path.exists("festival_map"):
        with open("festival_map", 'rb') as photo:
            context.bot.send_photo(
                chat_id=chat_id,
                photo=photo,
                caption='Вот карта фестиваля'
            )
    else:
        update.message.reply_text('Извините, карта временно недоступна.')

def main() -> None:
    """Запуск бота"""
    updater = Updater(TOKEN)
    dispatcher = updater.dispatcher

    # Обработчики команд
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.text("Карта фестиваля"), send_festival_map))

    # Запуск бота
    updater.start_polling()
    updater.idle()

main()