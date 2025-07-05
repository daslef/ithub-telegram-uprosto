from telegram import Bot
import os
import logging
import asyncio
from typing import Optional
import mysql.connector
from mysql.connector import Error
from fpdf import FPDF

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'festival_navigator',
    'user': 'user',
    'password': '1234'
}

class PDFGenerator(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Выбор пользователя', 0, 1, 'C')
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Страница {self.page_no()}', 0, 0, 'C')

def create_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Ошибка подключения к MySQL: {e}")
        return None

async def get_user_selections(user_id: int):
    connection = create_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return None
        query = """
        SELECT c.category_name, o.organization_name, us.custom_text
        FROM user_selections us
        JOIN categories c ON us.category_id = c.category_id
        LEFT JOIN organizations o ON us.organization_id = o.organization_id
        WHERE us.user_id = %s
        ORDER BY c.category_name
        """
        cursor.execute(query, (user_id,))
        selections = cursor.fetchall()
        
        return {
            'user': user,
            'selections': selections
        }
    except Error as e:
        logger.error(f"Ошибка при получении данных: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_pdf(data: dict) -> str:
    pdf = PDFGenerator()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    user = data['user']
    pdf.cell(0, 10, f"Пользователь: {user.get('last_name', '')} {user.get('name', '')} {user.get('middle_name', '')}", 0, 1)
    pdf.cell(0, 10, f"Телефон: {user.get('phone_number', 'не указан')}", 0, 1)
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Выбранные категории и организации:", 0, 1)
    pdf.set_font("Arial", size=10)
    
    for selection in data['selections']:
        category = selection['category_name']
        org = selection['organization_name'] or selection['custom_text'] or "Не указано"
        pdf.multi_cell(0, 10, f"• {category}: {org}")

    pdf_path = f"user_selection_{data['user']['user_id']}.pdf"
    pdf.output(pdf_path)
    
    return pdf_path

async def send_pdf(chat_id: str, bot_token: str, user_id: int) -> None:
    bot = Bot(token=bot_token)
    pdf_path: Optional[str] = None
    
    try:
        data = await get_user_selections(user_id)
        if not data or not data['selections']:
            await bot.send_message(chat_id=chat_id, text="У вас пока нет сохраненных выборов.")
            return
        pdf_path = create_pdf(data)
  
        with open(pdf_path, "rb") as file:
            await bot.send_document(
                chat_id=chat_id, 
                document=file,
                caption="Ваш выбор сохранен в PDF файле:"
            )
        
        logger.info("PDF успешно отправлен!")
        
    except Exception as e:
        logger.error(f"Произошла ошибка: {e}")
        await bot.send_message(chat_id=chat_id, text=f"Ошибка: {e}")
    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)
            logger.info("Временный PDF файл удален")

async def main():
    
    user_id = 1
    
    await send_pdf(
        chat_id="@Dashatru_bot",  
        bot_token="8140513380:AAHTFVRAMc-38YiCBVk13yD4VMITTmIhwaU",
        user_id=user_id
    )

if __name__ == "__main__":
    asyncio.run(main())