from .abc import AbstractBuilder


class HTMLBuilder(AbstractBuilder):
    def _render_heading(self, text):
        return f"<strong>{text}</strong>"

    def _render_subheading(self, text):
        return f"<em>{text}</em>"

    def _render_table(self, data: list[dict]):
        return f"<pre>{'\n'.join(f'{item["username"]} ({item["phone_number"]})' for item in data)}</pre>"

    def build(self, data):
        match data:
            case {"type": "heading", "value": value}:
                return self._render_heading(value)
            case {"type": "subheading", "value": value}:
                return self._render_subheading(value)
            case {"type": "table", "value": value}:
                return self._render_table(value)
