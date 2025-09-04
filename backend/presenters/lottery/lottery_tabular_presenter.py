from presenters.base.tabular_builder import TabularBuilder
from presenters.abc import AbstractPresenter

# LotteryData = TypedDict("LotteryData", {"username": str, "date": str, "time": str})


class LotteryTabularPresenter(AbstractPresenter):
    def show(self):
        tabular_builder = TabularBuilder()
        with tabular_builder(
            "Регистрации", ["Username", "Name", "Phone", "Date", "Time"]
        ) as workbook:
            for row_num, row_data in enumerate(self._data):
                workbook.worksheet.write_string(row_num + 1, 0, row_data["username"])
                workbook.worksheet.write_string(
                    row_num + 1, 1, f"{row_data['first_name']} {row_data['last_name']}"
                )
                workbook.worksheet.write_string(
                    row_num + 1, 2, row_data["phone_number"]
                )
                workbook.worksheet.write_datetime(
                    row_num + 1, 3, row_data["date"], workbook.formats["date"]
                )
                workbook.worksheet.write_datetime(
                    row_num + 1, 4, row_data["time"], workbook.formats["time"]
                )

            workbook.worksheet.autofilter("B1:E1000")

        return tabular_builder.build()
