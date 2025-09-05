from presenters.base.tabular_builder import TabularBuilder
from presenters.abc import AbstractPresenter


class CompaniesTabularPresenter(AbstractPresenter):
    def __init__(self, title: str, data: list):
        self._data = data
        self._title = title

    def show(self):
        tabular_builder = TabularBuilder()

        if self._title == "Паззл":
            columns = ["Username", "Name", "Phone", "Company", "Category", "Created_At"]
        else:
            columns = ["Username", "Name", "Phone", "Category", "Comment", "Created_At"]

        with tabular_builder(self._title, columns) as workbook:
            for row_num, row_data in enumerate(self._data):
                workbook.worksheet.write_string(row_num + 1, 0, row_data["username"])
                workbook.worksheet.write_string(
                    row_num + 1, 1, f"{row_data['first_name']} {row_data['last_name']}"
                )
                workbook.worksheet.write_string(
                    row_num + 1, 2, row_data["phone_number"]
                )
                workbook.worksheet.write_datetime(
                    row_num + 1, 5, row_data["created_at"], workbook.formats["datetime"]
                )

                if self._title == "Паззл":
                    workbook.worksheet.write_string(row_num + 1, 3, row_data["company"])
                    workbook.worksheet.write_string(
                        row_num + 1, 4, row_data["category"]
                    )
                else:
                    workbook.worksheet.write_string(
                        row_num + 1, 3, row_data["category"]
                    )
                    workbook.worksheet.write_string(row_num + 1, 4, row_data["comment"])

            workbook.worksheet.autofilter("A1:F1000")

        return tabular_builder.build()
