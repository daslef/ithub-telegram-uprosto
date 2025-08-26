from .abc import AbstractBuilder
from prettytable import PrettyTable


class HTMLBuilder(AbstractBuilder):
    def _render_heading(self, text):
        return f"<strong>{text}</strong>"

    def _render_subheading(self, text):
        return f"<em>{text}</em>"

    def _render_table(self, data: list[dict]):
        table = PrettyTable(["username"])
        for item in data:
            table.add_row([item["username"]])
        return f"<pre>{table.get_string()}</pre>"

    def build(self, data):
        match data:
            case {"type": "heading", "value": value}:
                return self._render_heading(value)
            case {"type": "subheading", "value": value}:
                return self._render_subheading(value)
            case {"type": "table", "value": value}:
                return self._render_table(value)
