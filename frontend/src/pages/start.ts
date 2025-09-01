import { renderPage } from '../router'
import { tg } from '../telegram-web-app'
import { usePuzzleStore } from '../store/puzzle'


function cleanButtons() {
    tg.MainButton.hide().disable().offClick(navigateToCategories)
    tg.SecondaryButton.hide().disable().offClick(resetAndNavigateToCategories)
}

function navigateToCategories() {
    cleanButtons()
    renderPage('categories')
}

function resetAndNavigateToCategories() {
    usePuzzleStore.getState().clearAll()
    cleanButtons()
    renderPage('categories')
}

async function renderButtons() {
    tg.MainButton.setParams({
        text: 'Продолжить',
        color: '#9C8CD9',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    tg.SecondaryButton.setParams({
        text: 'Начать сначала',
        color: '#F4EDE5',
        text_color: '#000000',
        is_active: false,
        is_visible: false
    })

    tg.MainButton.onClick(navigateToCategories)
    tg.SecondaryButton.onClick(resetAndNavigateToCategories)

    await usePuzzleStore.persist.rehydrate()
    const hasData = usePuzzleStore.getState().completedIds().length
    console.log(hasData)

    if (hasData) {
        tg.MainButton.enable().show()
        tg.SecondaryButton.enable().show()
    } else {
        tg.MainButton.setText('Начать!').enable().show()
    }
}

export default async function StartPage() {
    await renderButtons()
}
