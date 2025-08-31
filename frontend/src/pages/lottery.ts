import { renderPage } from "../router"
import { tg } from "../telegram-web-app"
import { cloudProvider } from "../storage"
import type { StorageLottery } from '../types'

type DatetimeObject = {
    date: number,
    hour: number,
    minute: number
}

function sendLotteryData(date?: string, time?: string) {
    if (!date || !time) {
        return
    }

    tg.showConfirm(`Подтвердите согласие на обработку персональных данных`, (isOK) => {
        if (!isOK) {
            return
        }

        tg.requestContact((success, response) => {
            if (success) {
                const contact = (response as RequestContactResponseSent).responseUnsafe.contact
                const registrationDatetime = `${date} августа, ${time}`
                const payload = {
                    date,
                    time,
                    phone_number: contact.phone_number ?? "",
                    first_name: contact.first_name ?? "",
                    last_name: contact.last_name ?? ""
                }

                tg.showPopup({ title: `Заявка принята`, message: `Вы зарегистрированы на ${registrationDatetime}` }, (_) => {
                    cloudProvider()
                        .setItem<StorageLottery>('lottery', payload)
                        .catch(error => {
                            console.log(error)
                        })
                        .then(() => {
                            tg.sendData(JSON.stringify({ payload, type: "lottery" }))
                        })
                        .catch(error => {
                            console.log(error)
                        })
                })
            }
        })
    })
}

function showTimeslots(event: MouseEvent | TouchEvent) {
    const detailsElement = document.querySelector<HTMLDetailsElement>('.lottery-container')!
    const timeContainers = document.querySelectorAll<HTMLElement>('.lottery-container > div > .lottery-input-container')
    const selectedTimeContainer = event.currentTarget as HTMLElement

    detailsElement.open = true

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


export default function LotteryPage() {
    function cleanButtons() {
        tg.BackButton.offClick(navigateBackToCategories).hide()
        registerButton.offClick(() => sendLotteryData(registrationDate, registrationTime)).hide().disable()
    }

    function navigateBackToCategories() {
        cleanButtons()
        renderPage('categories')
    }

    const registerButton = tg.MainButton.setParams({
        text: 'Отправить данные',
        color: '#FF9448',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    tg.BackButton.onClick(navigateBackToCategories).show()
    registerButton.onClick(() => sendLotteryData(registrationDate, registrationTime))

    let registrationDate: string | undefined;
    let registrationTime: string | undefined;

    const dateContainers = document.querySelectorAll<HTMLElement>('.lottery-summary .lottery-input-container')
    const timeContainers = document.querySelectorAll<HTMLElement>('.lottery-container > div > .lottery-input-container')

    for (const dateContainer of dateContainers) {
        const date = dateContainer.dataset.date
        if (date && isDatePassed(Number(date))) {
            dateContainer.querySelector('input')?.setAttribute('disabled', 'disabled')
        }
        dateContainer.addEventListener('click', showTimeslots)
    }

    for (const timeContainer of timeContainers) {
        timeContainer.addEventListener('click', (event: MouseEvent | TouchEvent) => {
            const eventTarget = event.target as HTMLElement
            registrationDate = eventTarget.parentElement!.dataset.date
            registrationTime = eventTarget.parentElement!.dataset.time
            if (registrationDate && registrationTime) {
                registerButton.enable().show()
            }
        })
    }
}
