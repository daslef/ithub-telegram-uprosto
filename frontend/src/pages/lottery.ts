import { renderPage } from "../router"
import { tg } from "../telegram-web-app"
import { useLotteryStore } from "../store/lottery"
import { requestContact } from '../utils/promises'
import type { Credentials, LotteryDatetime } from "../types"

function sendLotteryData(date?: string, time?: string) {
    if (!date || !time) {
        return
    }

    const datetimePayload: LotteryDatetime = { date, time };
    let credentialsPayload: Credentials | undefined;

    requestContact('Подтвердите согласие на обработку персональных данных')
        .then(contact => {
            credentialsPayload = {
                phone_number: contact.phone_number ?? "",
                first_name: contact.first_name ?? "",
                last_name: contact.last_name ?? ""
            }
            useLotteryStore.getState().setCredentials(credentialsPayload)
            useLotteryStore.getState().setDatetime(datetimePayload)
        })
        .then(() => {
            tg.sendData(JSON.stringify({ payload: { ...datetimePayload, ...credentialsPayload }, type: "lottery" }))
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
        const timeContainerTimestamp = parseDatetimeAttributes(timeContainer)
        if (!timeContainerTimestamp) {
            return
        }
        const timeInput = timeContainer.querySelector('input')
        if (isDatetimePassed(timeContainerTimestamp)) {
            timeInput?.setAttribute('disabled', 'disabled')
        } else {
            timeInput?.removeAttribute('disabled')
        }
    }
}

function parseDatetimeAttributes(element: HTMLElement): number | undefined {
    if (!element.dataset.date || !element.dataset.time) {
        return
    }
    return Date.parse(`${element.dataset.date}T${element.dataset.time}`)
}

function isDatetimePassed(timestamp: number) {
    return Date.now() > timestamp
}

function isDatePassed(date: string) {
    const currentDate = new Date().getDate()
    return currentDate > Date.parse(date)
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
        if (date && isDatePassed(date)) {
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
