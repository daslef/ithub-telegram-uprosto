from presenters.lottery.lottery_html_presenter import LotteryHTMLPresenter
from presenters.lottery.lottery_tabular_presenter import LotteryTabularPresenter
from database.models.lottery import LotteryRecord


def show_lottery_report():
    try:
        return LotteryHTMLPresenter(LotteryRecord.get_all()).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"


def send_lottery_report():
    try:
        return LotteryTabularPresenter(LotteryRecord.get_all()).show()
    except Exception as e:
        print(e)
        return "Приносим извинения за технические неполадки. Попробуйте позже"
