import { renderPage } from '../router'
import { tg } from '../telegram-web-app'

import { usePuzzleStore } from '../store/puzzle'
import { useCredentialsStore } from '../store/credentials'
import { useLotteryStore } from '../store/lottery';

function navigateToCategories() {
    renderPage('categories')
}

function navigateToMap() {
    renderPage('map')
}

function navigateToLottery() {
    renderPage('lottery')
}


function resetAndNavigateToCategories() {
    usePuzzleStore.getState().clearAll()
    useCredentialsStore.getState().clearAll()
    useLotteryStore.getState().clearAll()
    navigateToCategories()
}


export default async function StartPage() {
    tg.MainButton.setParams({
        text: 'Образовательный паззл',
        color: '#9C8CD9',
        text_color: '#ffffff',
        is_active: true,
        is_visible: true
    })

    tg.SecondaryButton.setParams({
        text: 'Карта фестиваля',
        color: '#FF9448',
        text_color: '#ffffff',
        is_active: true,
        is_visible: true,
        position: "bottom"
    }).onClick(navigateToMap)

    const puzzleHasBeenSent = usePuzzleStore.getState().hasBeenSent
    const lotteryHasBeenSent = useLotteryStore.getState().hasBeenSent
    const lotteryHasBeenPassed = useLotteryStore.getState().hasBeenPassed()

    if (lotteryHasBeenPassed) {
        tg.MainButton.disable().hide()
    } else if (lotteryHasBeenSent) {
        tg.MainButton.setText('Изменить время розыгрыша').onClick(navigateToLottery)
    } else if (puzzleHasBeenSent) {
        tg.MainButton.setText('Участвовать в розыгрыше').onClick(navigateToLottery)
    } else {
        tg.MainButton.onClick(navigateToCategories)
    }

    document.getElementById("clear-btn")?.addEventListener("click", resetAndNavigateToCategories, { once: true });
}
