from io import BytesIO
from .abc import AbstractBuilder
from fpdf import FPDF


class PDFBuilder(FPDF, AbstractBuilder):
    def __enter__(self):
        self._output_stream = BytesIO()
        self.add_font("Andika", style="", fname="Andika-Regular.ttf")
        self.set_font("Andika")
        self.set_title("Просто учиться!")
        self.set_author("Просто учиться")
        return self

    def __exit__(self, type, value, traceback):
        return

    def render_header(self):
        self.set_font_size(16)

        # Calculating width of title and setting cursor position:
        width = self.get_string_width(self.title) + 6
        self.set_x((210 - width) / 2)

        # Setting colors for frame, background and text:
        self.set_draw_color(0, 80, 180)
        self.set_text_color(220, 50, 50)
        self.set_line_width(1)  # Setting thickness of the frame (1 mm)
        # Printing title:
        self.cell(
            width,
            9,
            self.title,
            border=1,
            new_x="LMARGIN",
            new_y="NEXT",
            align="C",
            fill=True,
        )
        self.ln(10)

    def render_footer(self):
        self.set_y(-15)  # 1.5 cm from bottom
        self.set_font_size(8)
        self.set_text_color(128)  # gray
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def render_title(self, label):
        self.ln(6)

        self.set_font_size(14)
        self.set_fill_color(200, 220, 255)  # Setting background color

        self.cell(
            0,
            6,
            label,
            new_x="LMARGIN",
            new_y="NEXT",
            align="L",
            fill=True,
        )

        self.ln(4)

    def render_subheading(self, text):
        self.set_font_size(14)
        self.write(text=text)
        self.ln(8)

    def render_paragraph(self, text):
        self.set_font_size(12)
        self.write(text=text)
        self.ln(8)

    def build(self):
        self.output(self._output_stream)
        self._output_stream.seek(0)
        return self._output_stream.getvalue()
