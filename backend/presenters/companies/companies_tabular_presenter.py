from presenters.base.tabular_builder import TabularBuilder
from presenters.abc import AbstractPresenter

# LotteryData = TypedDict("LotteryData", {"username": str, "date": str, "time": str})


class CompaniesTabularPresenter(AbstractPresenter):
    def show(self):
        tabular_builder = TabularBuilder()
        with tabular_builder(
            "Паззл", ["Username", "Name", "Phone", "Company", "Category", "Created_At"]
        ) as workbook:
            for row_num, row_data in enumerate(self._data):
                workbook.worksheet.write_string(row_num + 1, 0, row_data["username"])
                workbook.worksheet.write_string(
                    row_num + 1, 1, f"{row_data['first_name']} {row_data['last_name']}"
                )
                workbook.worksheet.write_string(
                    row_num + 1, 2, row_data["phone_number"]
                )
                workbook.worksheet.write_string(row_num + 1, 3, row_data["company"])
                workbook.worksheet.write_string(row_num + 1, 4, row_data["category"])
                workbook.worksheet.write_datetime(
                    row_num + 1, 5, row_data["created_at"], workbook.formats["datetime"]
                )

            workbook.worksheet.autofilter("A1:F1000")

        return tabular_builder.build()
