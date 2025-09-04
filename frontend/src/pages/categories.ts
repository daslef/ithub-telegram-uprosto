import { renderPage } from '../router'
import { categories } from '../storage'
import { tg } from '../telegram-web-app';
import { usePuzzleStore } from '../store/puzzle';
import { useLotteryStore } from '../store/lottery';
import { useCredentialsStore } from '../store/credentials';
import { requestContact } from '../utils/promises';
import type { CategoryId, PuzzleDTO } from '../types';


function renderStatus(completedCount: number) {
    const statusElement = document.querySelector('.game-status > span')!
    statusElement.innerHTML = `(заполнено: ${completedCount}/${categories.length})`
}

function renderCategories(completedCategories: CategoryId[]) {
    const categoriesElement = document.querySelector('.categories')!

    for (const { id, category } of categories) {
        const buttonElement = categoriesElement.querySelector(`#${id}`)!

        if (completedCategories.includes(id)) {
            buttonElement.classList.add('disabled')
        }

        for (const child of buttonElement.children) {
            child.addEventListener('click', () => {
                cleanButtons()
                renderPage('items', category)
            })
        }
    }
}

function cleanButtons() {
    tg.MainButton.hide().disable().offClick(sendPuzzleData)
    tg.SecondaryButton.hide().disable().offClick(navigateToLottery)
}

function navigateToLottery() {
    cleanButtons()
    renderPage("lottery")
}

async function sendPuzzleData() {
    cleanButtons()

    try {
        const hasCredentialsSet = useCredentialsStore.getState().isSet()
        if (!hasCredentialsSet) {

            const contact = await requestContact('Подтвердите согласие на обработку персональных данных')
            useCredentialsStore.getState().setCredentials({
                phone_number: contact.phone_number ?? "",
                first_name: contact.first_name ?? "",
                last_name: contact.last_name ?? ""
            })
        }

        const data: PuzzleDTO = {
            type: 'puzzle',
            payload: usePuzzleStore.getState().items,
            credentials: useCredentialsStore.getState().credentials
        }

        usePuzzleStore.getState().markAsSent()
        tg.sendData(JSON.stringify(data))
    } catch (error) {
        console.log(error)
    }
}


function renderButtons(completedCount: number) {
    const lotteryHasBeenSent = useLotteryStore.getState().hasBeenSent

    tg.MainButton.setParams({
        text: 'Сформировать пазл',
        color: '#FF9448',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    tg.SecondaryButton.setParams({
        text: lotteryHasBeenSent ? 'Изменить время розыгрыша' : 'Участвовать в розыгрыше',
        color: '#9C8CD9',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false,
        position: "bottom"
    })

    tg.BackButton.hide()
    tg.MainButton.onClick(sendPuzzleData)
    tg.SecondaryButton.onClick(navigateToLottery)

    if (completedCount === categories.length) {
        tg.MainButton.enable().show()
        tg.SecondaryButton.enable().show()
    }
}

export default async function CategoriesPage() {
    const completedCategories = usePuzzleStore.getState().completedIds()

    renderStatus(Object.keys(completedCategories).length)
    renderButtons(Object.keys(completedCategories).length)
    renderCategories(completedCategories)
}
