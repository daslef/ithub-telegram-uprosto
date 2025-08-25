from presenters.companies.companies_pdf_presenter import CompaniesPDFPresenter
from presenters.companies.companies_tabular_presenter import CompaniesTabularPresenter
from database.models.company import CompanyRecord


def send_users_answers_report():
    try:
        return CompaniesTabularPresenter(CompanyRecord.get_all()).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"


def send_companies_brochure(username: str):
    try:
        return CompaniesPDFPresenter(CompanyRecord.get_by_username(username)).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"
