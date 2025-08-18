import { renderPage } from "../router"
import { tg } from "../telegram-web-app"

type DatetimeObject = {
    date: number,
    hour: number,
    minute: number
}

export default function LotteryPage() {
    function renderButtons() {
        function cleanButtons() {
            backToCategoriesButton.hide()
            backToCategoriesButton.offClick(navigateBackToCategories)
            registerButton.hide().disable().offClick(sendLotteryData)
        }

        function navigateBackToCategories() {
            cleanButtons()
            renderPage('categories')
        }

        function sendLotteryData() {
            tg.showPopup({ title: 'Уважаемый гость', message: `Подтвердите согласие на обработку персональных данных` }, () => {
                tg.requestContact((success, response) => {
                    if (success) {
                        const contact = (response as RequestContactResponseSent).responseUnsafe.contact
                        tg.showPopup({ title: `Заявка принята`, message: `${contact.first_name} ${contact.last_name ?? ""} (${contact.phone_number}), Вы зарегистрированы на ${registrationDatetime}` })
                    } else {
                        tg.showPopup({ title: `${tg.version}`, message: JSON.stringify(response) })
                    }
                })
            })
            // cloudProvider()
            //     .getItem<Storage>('festival')
            //     .then(data => tg.sendData(JSON.stringify(data)))
            //     .catch(error => {
            //         console.error(error)
            //     })
            //     .finally(() => {
            //         cleanButtons()
            //     })
        }

        const registerButton = tg.MainButton.setParams({
            text: 'Отправить данные',
            color: '#364CA0',
            text_color: '#ffffff',
            is_active: false,
            is_visible: false
        })

        const backToCategoriesButton = tg.BackButton

        backToCategoriesButton.onClick(navigateBackToCategories)
        registerButton.onClick(sendLotteryData)

        backToCategoriesButton.show()

        return { registerButton }
    }

    function showTimeslots(event: MouseEvent | TouchEvent) {
        detailsElement.open = true

        const selectedTimeContainer = event.currentTarget as HTMLElement

        for (const timeContainer of timeContainers) {
            timeContainer.dataset.date = selectedTimeContainer.dataset.date
            const timeContainerDatatime = parseDatetimeAttributes(timeContainer)
            if (!timeContainerDatatime) {
                return
            }
            const timeInput = timeContainer.querySelector('input')
            if (isDatetimePassed(timeContainerDatatime)) {
                timeInput?.setAttribute('disabled', 'disabled')
            } else {
                timeInput?.removeAttribute('disabled')
            }
        }
    }

    function dateTimeNow() {
        const now = new Date()
        return {
            date: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes()
        }
    }

    function parseDatetimeAttributes(element: HTMLElement): DatetimeObject | undefined {
        if (!element.dataset.date || !element.dataset.time) {
            return
        }
        const [hour, minute] = element.dataset.time.split(':')
        return {
            date: +element.dataset.date,
            hour: Number(hour),
            minute: Number(minute)
        }
    }

    function isDatetimePassed({ date, hour, minute }: DatetimeObject) {
        const currentDatetime = dateTimeNow()
        return currentDatetime.date > date
            || currentDatetime.date === date && currentDatetime.hour > hour
            || currentDatetime.date === date && currentDatetime.hour === hour && currentDatetime.minute >= minute
    }

    function isDatePassed(date: number) {
        const currentDate = dateTimeNow().date
        return currentDate > date
    }

    const detailsElement = document.querySelector<HTMLDetailsElement>('.lottery-container')!
    const dateContainers = document.querySelectorAll<HTMLElement>('.lottery-summary .lottery-input-container')
    const timeContainers = document.querySelectorAll<HTMLElement>('.lottery-container > div > .lottery-input-container')

    let registrationDatetime: string | null = null

    for (const dateContainer of dateContainers) {
        const date = dateContainer.dataset.date
        if (date && isDatePassed(Number(date))) {
            dateContainer.querySelector('input')?.setAttribute('disabled', 'disabled')
        }
        dateContainer.addEventListener('click', (event: MouseEvent | TouchEvent) => showTimeslots(event))
    }

    for (const timeContainer of timeContainers) {
        timeContainer.addEventListener('click', (event: MouseEvent | TouchEvent) => {
            const eventTarget = event.target as HTMLElement

            registrationDatetime = `${eventTarget.parentElement!.dataset.date} августа, ${eventTarget.parentElement!.dataset.time}`
            if (registrationDatetime) {
                registerButton.enable().show()
            }
        })
    }

    const { registerButton } = renderButtons()
}
