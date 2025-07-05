import mysql.connector
from fpdf import FPDF

def fetch_data():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="bot_db_local"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT category_name, category_description FROM `categories`")
    data = cursor.fetchall()
    conn.close()
    return data


def create_pdf(data, filename="export.pdf"):
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font(fname='DejaVuSans.ttf')
    pdf.set_font('DejaVuSans', size=14)
    pdf.set_text_shaping(True)


    pdf.cell(0, 10, "Экспорт данных из SQL", align="C")

    for row in data:
        for item in row:
            pdf.cell(40, 10, str(item), border=1)
        pdf.ln() 

    pdf.output(filename)
    return filename

create_pdf(fetch_data())
from telegram import Bot
import os

    # async def send_pdf(chat_id, bot_token):
    # bot = Bot(token='8140513380:AAHTFVRAMc-38YiCBVk13yD4VMITTmIhwaU')
    # data = fetch_data()  
    # pdf_path = create_pdf(data)  

    # with open(pdf_path, "rb") as file:
    #     await bot.send_document(chat_id="https://t.me/Dashatru_botchat_id", document=file)
    
    # os.remove(pdf_path)
    
    