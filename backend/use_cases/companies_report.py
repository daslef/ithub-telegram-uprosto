from typing import Literal
from presenters.companies.companies_pdf_presenter import CompaniesPDFPresenter
from presenters.companies.companies_tabular_presenter import CompaniesTabularPresenter
from database.models.company import CompanyRecord
from database.models.comment import CommentRecord

type UsersReportType = Literal["comments" | "companies"]


def send_users_answers_report(report_type: UsersReportType):
    try:
        if report_type == "companies":
            return CompaniesTabularPresenter("Паззл", CompanyRecord.get_all()).show()
        elif report_type == "comments":
            return CompaniesTabularPresenter(
                "Комментарии", CommentRecord.get_all()
            ).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"


def send_companies_brochure(username: str):
    try:
        return CompaniesPDFPresenter(CompanyRecord.get_by_username(username)).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"
