from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path
from typing import Optional

from fpdf import FPDF
from .abc import AbstractBuilder

PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOGO_SVG = PROJECT_ROOT / "frontend/public/logo.png"
LOGO_FULL = PROJECT_ROOT / "frontend/public/logo_full.jpg"
FONT_ONEST_REGULAR = PROJECT_ROOT / "frontend/public/fonts/Onest-Regular.ttf"
FONT_ONEST_SEMIBOLD = PROJECT_ROOT / "frontend/public/fonts/Onest-SemiBold.ttf"
FONT_DUDKA_BOLD = PROJECT_ROOT / "frontend/public/fonts/Dudka-Bold.ttf"

PHONE_RE = re.compile(r"^\+?\d[\d\s\-\(\)]{6,}$")


class PDFBuilder(FPDF, AbstractBuilder):
    _COLOR_PRIMARY = (136, 99, 255)
    _COLOR_BODY = (162, 140, 248)
    _COLOR_LABEL_BG = (155, 122, 255)
    _COLOR_LABEL_TEXT = (255, 255, 255)
    _COLOR_DIVIDER = (230, 222, 255)
    _COLOR_SUBTLE = (180, 170, 250)
    _COLOR_BLACKISH = (33, 37, 41)
    _COLOR_BG_DOODLE = (236, 231, 255)

    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(left=16, top=22, right=16)
        self.set_auto_page_break(auto=True, margin=18)
        self.set_page_background((244, 237, 243))
        self._is_cover = True
        self._output_stream: Optional[BytesIO] = None
        self._fonts_ready = False

    def __enter__(self):
        self._output_stream = BytesIO()
        self._register_fonts()
        self._configure_basics()
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def _configure_basics(self):
        self.set_title("Фестиваль Просто учиться")
        self.set_author("Просто учиться")
        try:
            self.set_text_shaping(True)
        except Exception:
            pass
        self._set_body_font()

    def _register_fonts(self):
        families = []

        if FONT_ONEST_REGULAR.exists():
            self.add_font("Onest", style="", fname=str(FONT_ONEST_REGULAR), uni=True)
            if FONT_ONEST_SEMIBOLD.exists():
                self.add_font(
                    "Onest", style="b", fname=str(FONT_ONEST_SEMIBOLD), uni=True
                )
            else:
                self.add_font(
                    "Onest", style="b", fname=str(FONT_ONEST_REGULAR), uni=True
                )
            families.append("Onest")

        if FONT_DUDKA_BOLD.exists():
            try:
                self.add_font("Dudka", style="b", fname=str(FONT_DUDKA_BOLD), uni=True)
                families.append("Dudka")
            except Exception:
                pass

        if "Onest" not in families:
            raise RuntimeError(
                "Unicode-шрифт Onest не найден. Проверьте пути:\n"
                f"{FONT_ONEST_REGULAR}\n{FONT_ONEST_SEMIBOLD}"
            )

        self._fonts_ready = True

    def _set_body_font(self, size: float = 11):
        assert self._fonts_ready
        self.set_font("Onest", size=size)

    def _set_bold_font(self, size: float):
        assert self._fonts_ready
        self.set_font("Onest", style="b", size=size)

    def render_cover(self):
        self.image(
            str(LOGO_FULL),
            w=self.epw * 2 / 3,
            x=self.epw / 4,
            y=self.eph * 4 / 9,
            keep_aspect_ratio=True,
        )
        self.set_page_background(None)

    def header(self):
        if self._is_cover:
            self._is_cover = False
            return

        y0, x0 = 12, 16

        if LOGO_SVG.exists():
            try:
                self.image(str(LOGO_SVG), x=x0, y=y0 - 1, w=24)
            except Exception:
                pass

        self.set_xy(x0 + 30, y0 - 1)
        self._set_body_font(9.5)
        self.set_text_color(*self._COLOR_SUBTLE)
        self.cell(0, 6, "Подборка организаций по вашим интересам", ln=1)

        # self._draw_doodles()

        self.set_draw_color(*self._COLOR_DIVIDER)
        self.set_line_width(0.3)
        self.set_y(20)
        self.line(16, self.get_y(), self.w - 16, self.get_y())
        self.ln(6)

        self._set_body_font()
        self.set_text_color(*self._COLOR_BLACKISH)

    def footer(self):
        self.set_y(-18)
        self.set_draw_color(*self._COLOR_DIVIDER)
        self.set_line_width(0.3)
        self.line(16, self.get_y(), self.w - 16, self.get_y())

        self.set_y(-14)
        self._set_body_font(9)
        self.set_text_color(160, 155, 230)
        self.cell(0, 8, f"Стр. {self.page_no()}", align="C")
        self._set_body_font()
        self.set_text_color(*self._COLOR_BLACKISH)

    def _draw_doodles(self):
        self.set_draw_color(*self._COLOR_BG_DOODLE)
        self.set_line_width(1.2)

        x, y = self.w - 80, 16
        self.line(x + 0, y + 0, x + 10, y + 6)
        self.line(x + 10, y + 6, x + 4, y + 6)
        self.line(x + 4, y + 6, x + 16, y + 12)

        cx, cy, r = self.w - 28, 20, 10
        self.line(cx - r, cy, cx + r, cy)
        self.line(cx, cy - r, cx, cy + r)
        self.line(cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7)
        self.line(cx - r * 0.7, cy + r * 0.7, cx + r * 0.7, cy - r * 0.7)

        self.set_line_width(0.2)
        self.set_draw_color(*self._COLOR_DIVIDER)

    def render_title(self, label: str):
        txt = label.strip()
        self._set_bold_font(12)
        padding_x, padding_y = 4.5, 3.2
        text_w = self.get_string_width(txt)
        w = text_w + padding_x * 2
        h = 8.5
        x = self.get_x()
        y = self.get_y()

        self.set_fill_color(*self._COLOR_LABEL_BG)
        try:
            self.rounded_rect(x, y, w, h, r=2.2, style="F")
        except Exception:
            self.rect(x, y, w, h, style="F")
        self.set_text_color(*self._COLOR_LABEL_TEXT)
        self.set_xy(x + padding_x, y + (h - 6) / 2.0)
        self.cell(text_w, 6, txt)
        self.set_xy(x, y + h + 3)
        self.set_text_color(*self._COLOR_PRIMARY)
        self.ln(1)

    def render_subheading(self, text: str):
        self.ln(2)
        self._set_bold_font(16)
        self.set_text_color(*self._COLOR_PRIMARY)
        self.multi_cell(w=0, h=7, txt=text)
        self.ln(1)
        self._set_body_font(11)

    def render_paragraph(self, text: str):
        stripped = (text or "").strip()
        if PHONE_RE.match(stripped):
            self._render_phone(stripped)
            self._draw_separator()
            return

        self.set_text_color(*self._COLOR_BODY)
        self.multi_cell(w=0, h=6, txt=stripped, align="J")
        self.ln(1.5)
        self.set_text_color(*self._COLOR_BLACKISH)

    def _render_phone(self, phone_text: str):
        tel_url = f"tel:{re.sub(r'[^0-9+]', '', phone_text)}"
        self._set_bold_font(12.5)
        self.set_text_color(*self._COLOR_PRIMARY)
        self.cell(w=0, h=7, txt=phone_text, link=tel_url, ln=1)
        self.ln(1)
        self._set_body_font(11)
        self.set_text_color(*self._COLOR_BLACKISH)

    def _draw_separator(self):
        self.set_draw_color(*self._COLOR_DIVIDER)
        self.set_line_width(0.4)
        y = self.get_y() + 2
        self.line(16, y, self.w - 16, y)
        self.ln(5)

    def build(self) -> bytes:
        pdf_bytes_like = self.output(dest="S")
        return bytes(pdf_bytes_like)
