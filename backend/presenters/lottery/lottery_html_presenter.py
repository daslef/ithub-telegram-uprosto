from itertools import groupby
from presenters.abc import AbstractPresenter
from presenters.base.html_builder import HTMLBuilder

# LotteryData = TypedDict("LotteryData", {"username": str, "date": str, "time": str})


class LotteryHTMLPresenter(AbstractPresenter):
    def _get_grouped_data(self):
        def by_datetime(item):
            return (item["date"], item["time"])

        return groupby(sorted(self._data, key=by_datetime), key=by_datetime)

    def _preformat(self):
        for item in self._data:
            item["date"] = f"{item['date']:%d.%m}"
            item["time"] = f"{item['time']:%H:%M}"

    def show(self):
        self._preformat()
        builder = HTMLBuilder()

        result_chunks = []

        for group_name, group_items in self._get_grouped_data():
            result_chunks.append(
                builder.build({"type": "heading", "value": " / ".join(group_name)})
            )

            result_chunks.append(
                builder.build(
                    {
                        "type": "table",
                        "value": group_items,
                    }
                )
            )

        return "\n".join(result_chunks)
