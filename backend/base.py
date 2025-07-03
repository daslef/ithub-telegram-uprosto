import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackQueryHandler, CallbackContext
import mysql.connector
from mysql.connector import Error

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)
DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'festival_navigator',
    'user': 'your_username',
    'password': 'your_password'
}
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        logger.error(f"Ошибка подключения к MySQL: {e}")
        return None
def start(update: Update, context: CallbackContext) -> None:
    user = update.effective_user
    update.message.reply_text(
        f"Привет, {user.first_name}! Я бот для навигации по фестивалю.\n"
        "Используйте /categories чтобы увидеть категории мероприятий."
    )
def show_categories(update: Update, context: CallbackContext) -> None:
    connection = get_db_connection()
    if not connection:
        update.message.reply_text("Ошибка подключения к базе данных.")
        return
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories")
        categories = cursor.fetchall()

        keyboard = []
        for category in categories:
            keyboard.append([InlineKeyboardButton(
                category['category_name'],
                callback_data=f"category_{category['category_id']}"
            )])

        reply_markup = InlineKeyboardMarkup(keyboard)
        update.message.reply_text(
            "Выберите категорию:",
            reply_markup=reply_markup
        )
    except Error as e:
        logger.error(f"Ошибка при получении категорий: {e}")
        update.message.reply_text("Произошла ошибка при получении категорий.")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
def category_handler(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    query.answer()

    category_id = int(query.data.split('_')[1])
    
    connection = get_db_connection()
    if not connection:
        query.edit_message_text("Ошибка подключения к базе данных.")
        return

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories WHERE category_id = %s", (category_id,))
        category = cursor.fetchone()
        cursor.execute("""
            SELECT * FROM organizations 
            WHERE category_id = %s
            ORDER BY organization_name
        """, (category_id,))
        organizations = cursor.fetchall()

        if organizations:
            org_buttons = []
            for org in organizations:
                org_buttons.append([InlineKeyboardButton(
                    org['organization_name'],
                    callback_data=f"org_{org['organization_id']}"
                )])
            
            org_buttons.append([InlineKeyboardButton(
                " Назад к категориям",
                callback_data="back_to_categories"
            )])
            
            reply_markup = InlineKeyboardMarkup(org_buttons)
            query.edit_message_text(
                f"Категория: {category['category_name']}\n"
                f"Описание: {category['category_description']}\n\n"
                "Выберите организацию:",
                reply_markup=reply_markup
            )
        else:
            query.edit_message_text(
                f"Категория: {category['category_name']}\n"
                f"Описание: {category['category_description']}\n\n"
                "В этой категории пока нет организаций."
            )
            show_categories(update, context)
            
    except Error as e:
        logger.error(f"Ошибка при получении информации о категории: {e}")
        query.edit_message_text("Произошла ошибка при получениинформации.")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
def organization_handler(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    query.answer()

    if query.data == "back_to_categories":
        show_categories(update, context)
        return

    org_id = int(query.data.split('_')[1])
    
    connection = get_db_connection()
    if not connection:
        query.edit_message_text("Ошибка подключения к базе данных.")
        return

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT o.*, c.category_name 
            FROM organizations o
            JOIN categories c ON o.category_id = c.category_id
            WHERE o.organization_id = %s
        """, (org_id,))
        organization = cursor.fetchone()

        if organization:
            message_text = (
                f" Организация: {organization['organization_name']}\n"
                f" Категория: {organization['category_name']}\n\n"
                f" Описание:\n{organization['description']}\n\n"
                f" Контакты:\n{organization['contact_info']}"
            )
            keyboard = [
                [InlineKeyboardButton(" Назад к организациям", 
                 callback_data=f"category_{organization['category_id']}")],
                [InlineKeyboardButton(" Выбрать эту организацию", 
                 callback_data=f"select_{org_id}")]
            ]
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            query.edit_message_text(
                message_text,
                reply_markup=reply_markup
            )
            
    except Error as e:
        logger.error(f"Ошибка при получении информации об организации: {e}")
        query.edit_message_text("Произошла ошибка при получении информации.")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
def select_organization(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    query.answer()

    org_id = int(query.data.split('_')[1])
    user_id = query.from_user.id
    
    connection = get_db_connection()
    if not connection:
        query.edit_message_text("Ошибка подключения к базе данных.")
        return

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT category_id FROM organizations WHERE organization_id = %s", (org_id,))
        org_info = cursor.fetchone()
        
        if not org_info:
            query.edit_message_text("Организация не найдена.")
            return
            
        category_id = org_info['category_id']
        cursor.execute("""
            SELECT * FROM user_selections 
            WHERE user_id = %s AND category_id = %s
        """, (user_id, category_id))
        existing_selection = cursor.fetchone()
        
        if existing_selection:
            cursor.execute("""
                UPDATE user_selections 
                SET organization_id = %s, selection_time = CURRENT_TIMESTAMP 
                WHERE selection_id = %s
            """, (org_id, existing_selection['selection_id']))
        else:
            cursor.execute("""
                INSERT INTO user_selections 
                (user_id, category_id, organization_id) 
                VALUES (%s, %s, %s)
            """, (user_id, category_id, org_id))
        
        connection.commit()
        query.edit_message_text(" Организация успешно выбрана!")
        
    except Error as e:
        logger.error(f"Ошибка при сохранении выбора организации: {e}")
        query.edit_message_text("Произошла ошибка при сохранении выбора.")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
def show_user_selections(update: Update, context: CallbackContext) -> None:
    user_id = update.effective_user.id
    
    connection = get_db_connection()
    if not connection:
        update.message.reply_text("Ошибка подключения к базе данных.")
        return

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT us.selection_id, c.category_name, o.organization_name, o.description, o.contact_info
            FROM user_selections us
            JOIN categories c ON us.category_id = c.category_id
            LEFT JOIN organizations o ON us.organization_id = o.organization_id
            WHERE us.user_id = %s
            ORDER BY us.selection_time DESC
        """, (user_id,))
        selections = cursor.fetchall()

        if selections:
            message_text = " Ваши выборы:\n\n"
            for selection in selections:
                message_text += (
                    f"Категория: {selection['category_name']}\n"
                    f" Организация: {selection['organization_name'] or 'Не выбрано'}\n"
                )
                if selection['description']:
                    message_text += f" Описание: {selection['description']}\n"
                if selection['contact_info']:
                    message_text += f" Контакты: {selection['contact_info']}\n"
                message_text += "\n"
            
            update.message.reply_text(message_text)
        else:
            update.message.reply_text("Вы пока ничего не выбрали. Используйте /categories чтобы начать.")
            
    except Error as e:
        logger.error(f"Ошибка при получении выборов пользователя: {e}")
        update.message.reply_text("Произошла ошибка при получении ваших выборов.")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def error_handler(update: Update, context: CallbackContext) -> None:
    logger.error(f'Update {update} caused error {context.error}')
    if update.callback_query:
        update.callback_query.message.reply_text('Произошла ошибка. Пожалуйста, попробуйте снова.')

def main() -> None:
    updater = Updater("8140513380:AAHTFVRAMc-38YiCBVk13yD4VMITTmIhwaU")
    dispatcher = updater.dispatcher

    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("categories", show_categories))
    dispatcher.add_handler(CommandHandler("my_selections", show_user_selections))
 
    dispatcher.add_handler(CallbackQueryHandler(category_handler, pattern='^category_'))
    dispatcher.add_handler(CallbackQueryHandler(organization_handler, pattern='^org_'))
    dispatcher.add_handler(CallbackQueryHandler(select_organization, pattern='^select_'))
    dispatcher.add_handler(CallbackQueryHandler(show_categories, pattern='^back_to_categories$'))
 
    dispatcher.add_error_handler(error_handler)
    
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()