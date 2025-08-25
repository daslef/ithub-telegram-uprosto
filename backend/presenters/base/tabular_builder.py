from io import BytesIO
import xlsxwriter
from .abc import AbstractBuilder


class TabularBuilder(AbstractBuilder):
    def __call__(self, sheet_title, columns):
        self._sheet_title = sheet_title
        self._columns = columns
        return self

    def __enter__(self):
        self._output_stream = BytesIO()
        self._workbook = xlsxwriter.Workbook(self._output_stream)

        self._formats = {
            "header": self._workbook.add_format({"bold": True, "align": "center"}),
            "date": self._workbook.add_format({"num_format": "dd.mm"}),
            "time": self._workbook.add_format({"num_format": "hh:mm"}),
            "datetime": self._workbook.add_format({"num_format": "dd.mm.yyyy hh:mm"}),
        }

        self._worksheet = self._workbook.add_worksheet(self._sheet_title)
        self._worksheet.write_row(0, 0, self._columns, self._formats["header"])

        return self

    def __exit__(self, type, value, traceback):
        return

    @property
    def worksheet(self):
        return self._worksheet

    @property
    def formats(self):
        return self._formats

    def build(self):
        self._worksheet.autofit()
        self._workbook.close()
        self._output_stream.seek(0)

        return self._output_stream.getvalue()
