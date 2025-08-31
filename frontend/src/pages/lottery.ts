import { renderPage } from "../router"
import { tg } from "../telegram-web-app"
import { cloudProvider } from "../storage"
import type { StorageLottery } from '../types'
import { requestContact, showPopup } from '../utils/promises'

type DatetimeObject = {
    date: number,
    hour: number,
    minute: number
}

function sendLotteryData(date?: string, time?: string) {
    if (!date || !time) {
        return
    }

    let payload: StorageLottery | undefined;

    requestContact('Подтвердите согласие на обработку персональных данных')
        .then(contact => {
            payload = {
                date,
                time,
                phone_number: contact.phone_number ?? "",
                first_name: contact.first_name ?? "",
                last_name: contact.last_name ?? ""
            }
            return cloudProvider().setItem<StorageLottery>('lottery', payload)
        })
        .then(() => showPopup({
            title: `Заявка принята`,
            message: `Вы зарегистрированы на ${date} сентября, ${time}`
        }))
        .then(() => {
            tg.sendData(JSON.stringify({ payload, type: "lottery" }))
        })
        .catch(error => {
            console.log(error)
        })
}

function showTimeslots(event: MouseEvent | TouchEvent) {
    const tileGroupElement = document.querySelector<HTMLDivElement>('.lottery-tile-group--time')!
    const timeContainers = tileGroupElement.querySelectorAll<HTMLDivElement>('.lottery-input-container')
    const selectedTimeContainer = event.currentTarget as HTMLElement

    tileGroupElement.classList.remove('hidden')

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
    const currentDatetime = new Date()

    return currentDatetime.getDate() > date
        || currentDatetime.getDate() === date && currentDatetime.getHours() > hour
        || currentDatetime.getDate() === date && currentDatetime.getHours() === hour && currentDatetime.getMinutes() >= minute
}

function isDatePassed(date: number) {
    return false // TODO fix 01.09
    const currentDate = new Date().getDate()
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

    const dateContainers = document.querySelectorAll<HTMLElement>('.lottery-tile-group--date .lottery-input-container')
    const timeContainers = document.querySelectorAll<HTMLElement>('.lottery-tile-group--time .lottery-input-container')

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
