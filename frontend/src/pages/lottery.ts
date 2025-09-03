import { renderPage } from "../router"
import { tg } from "../telegram-web-app"
import { isDatePassed, isTimestampPassed } from "../utils/time";
import { useLotteryStore } from "../store/lottery"
import { useCredentialsStore } from '../store/credentials';

async function sendLotteryData(date?: string, time?: string) {
    if (!date || !time) {
        return
    }

    useLotteryStore.getState().setDatetime({ date, time })

    try {
        const credentialsPayload = useCredentialsStore.getState().credentials
        useLotteryStore.getState().markAsSent()
        tg.sendData(JSON.stringify({ payload: { date, time, ...credentialsPayload }, type: "lottery" }))
    } catch (error) {
        console.log(error)
    }
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
        if (isTimestampPassed(timeContainerTimestamp)) {
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

export default function LotteryPage() {
    function navigateBackToCategories() {
        renderPage('categories')
    }

    const lotteryHasBeenSent = useLotteryStore.getState().hasBeenSent

    const registerButton = tg.MainButton.setParams({
        text: lotteryHasBeenSent ? 'Изменить данные' : 'Отправить данные',
        color: '#FF9448',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    tg.BackButton.onClick(navigateBackToCategories).show()
    registerButton.onClick(async () => await sendLotteryData(registrationDate, registrationTime))

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

    if (lotteryHasBeenSent) {
        registrationDate = useLotteryStore.getState().date!;
        registrationTime = useLotteryStore.getState().time!;

        const currentDateContainer = [...dateContainers].find(dateContainer => dateContainer.dataset.date === registrationDate)
        currentDateContainer?.dispatchEvent(new MouseEvent('click'))

        const currentTimeContainer = [...timeContainers].find(timeContainer => timeContainer.dataset.time === registrationTime)
        currentTimeContainer?.dispatchEvent(new MouseEvent('click'))
    }
}
