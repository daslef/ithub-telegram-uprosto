import os
import logging
import sqlite3
from fpdf import FPDF

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_data():
    conn = sqlite3.connect("db_local.sqlite3")
    cursor = conn.cursor()
    cursor.execute("SELECT category_name, category_description FROM `categories`")
    data = cursor.fetchall()
    conn.close()
    return data


# async def get_user_selections(user_id: int):
#     try:
#         cursor = connection.cursor(dictionary=True)

#         cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
#         user = cursor.fetchone()

#         if not user:
#             return None
#         query = """
#         SELECT c.category_name, o.organization_name, us.custom_text
#         FROM user_selections us
#         JOIN categories c ON us.category_id = c.category_id
#         LEFT JOIN organizations o ON us.organization_id = o.organization_id
#         WHERE us.user_id = %s
#         ORDER BY c.category_name
#         """
#         cursor.execute(query, (user_id,))
#         selections = cursor.fetchall()

#         return {"user": user, "selections": selections}
#     except Error as e:
#         logger.error(f"Ошибка при получении данных: {e}")
#         return None
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()


# async def send_pdf(chat_id: str, bot_token: str, user_id: int) -> None:
#     bot = Bot(token=bot_token)
#     pdf_path: Optional[str] = None

#     try:
#         data = await get_user_selections(user_id)
#         pdf_path = create_pdf(data)

#         with open(pdf_path, "rb") as file:
#             await bot.send_document(
#                 chat_id=chat_id,
#                 document=file,
#                 caption="Ваш выбор сохранен в PDF файле:",
#             )

#         logger.info("PDF успешно отправлен!")

#     except Exception as e:
#         logger.error(f"Произошла ошибка: {e}")
#         await bot.send_message(chat_id=chat_id, text=f"Ошибка: {e}")
#     finally:
#         if pdf_path and os.path.exists(pdf_path):
#             os.remove(pdf_path)
#             logger.info("Временный PDF файл удален")

# def create_pdf(data: dict) -> str:
#     pdf = PDFGenerator()
#     pdf.add_page()
#     pdf.set_font("Arial", size=12)

#     user = data["user"]
#     pdf.cell(
#         0,
#         10,
#         f"Пользователь: {user.get('last_name', '')} {user.get('name', '')} {user.get('middle_name', '')}",
#         0,
#         1,
#     )
#     pdf.cell(0, 10, f"Телефон: {user.get('phone_number', 'не указан')}", 0, 1)
#     pdf.ln(10)
#     pdf.set_font("Arial", "B", 12)
#     pdf.cell(0, 10, "Выбранные категории и организации:", 0, 1)
#     pdf.set_font("Arial", size=10)

#     for selection in data["selections"]:
#         category = selection["category_name"]
#         org = selection["organization_name"] or selection["custom_text"] or "Не указано"
#         pdf.multi_cell(0, 10, f"• {category}: {org}")

#     pdf_path = f"user_selection_{data['user']['user_id']}.pdf"
#     pdf.output(pdf_path)

#     return pdf_path

# class PDFGenerator(FPDF):
#     def header(self):
#         self.set_font("Arial", "B", 12)
#         self.cell(0, 10, "Выбор пользователя", 0, 1, "C")

#     def footer(self):
#         self.set_y(-15)
#         self.set_font("Arial", "I", 8)
#         self.cell(0, 10, f"Страница {self.page_no()}", 0, 0, "C")


def create_pdf(data, filename="export.pdf"):
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font(fname="DejaVuSans.ttf")
    pdf.set_font("DejaVuSans", size=14)
    pdf.set_text_shaping(True)

    pdf.cell(0, 10, "Экспорт данных из SQL", align="C")

    for row in data:
        for item in row:
            pdf.cell(40, 10, str(item), border=1)
        pdf.ln()

    pdf.output(filename)
    return filename


from telegram import Bot
import os
import logging
import asyncio
from typing import Optional

from pdf import fetch_data, create_pdf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def send_pdf(chat_id: str, bot_token: str) -> None:
    bot = Bot(token=bot_token)
    pdf_path: Optional[str] = None
    try:
        data = fetch_data()
        pdf_path = create_pdf(data)

        with open(pdf_path, "rb") as file:
            await bot.send_document(
                chat_id=chat_id,
                document=file,
                caption="Ваш PDF файл готов! Вот результаты:",
            )
        logger.info("PDF успешно отправлен!")

    except FileNotFoundError:
        logger.error("PDF файл не найден!")
        await bot.send_message(
            chat_id=chat_id, text="Ошибка: не удалось создать PDF файл"
        )
    except Exception as e:
        logger.error(f"Произошла ошибка: {e}")
        await bot.send_message(chat_id=chat_id, text=f"Ошибка: {e}")
    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)
            logger.info("Временный PDF файл удален")


async def main():
    await send_pdf(
        chat_id="@Dashatru_bot",
        bot_token="8140513380:AAHTFVRAMc-38YiCBVk13yD4VMITTmIhwaU",
    )


pdf_path = create_pdf(data)
if not os.path.exists(pdf_path):
    raise FileNotFoundError("PDF was not created")
logger.info(
    f"Fetched data: {type(data)}, length: {len(data) if hasattr(data, '__len__') else 'N/A'}"
)
logger.info(f"PDF created at: {pdf_path}")
