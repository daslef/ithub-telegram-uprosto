from itertools import groupby
from presenters.base.pdf_builder import PDFBuilder
from presenters.abc import AbstractPresenter


class CompaniesPDFPresenter(AbstractPresenter):
    def _preformat_data(self, data):
        def by_category(item):
            return item["category"]

        return groupby(sorted(data, key=by_category), key=by_category)

    def show(self):
        with PDFBuilder() as pdf_builder:
            data = self._preformat_data(self._data)

            for category, category_companies in data:
                pdf_builder.add_page()
                pdf_builder.render_title(
                    f'Категория "{category}"',
                )
                for company_data in category_companies:
                    pdf_builder.render_subheading(company_data["name"])
                    pdf_builder.render_paragraph(text=company_data["description"])
                    pdf_builder.render_paragraph(text=company_data["website"])
                    pdf_builder.render_paragraph(text=company_data["vk"])
                    pdf_builder.render_paragraph(text=company_data["address"])

        return pdf_builder.build()
