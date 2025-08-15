import { renderPage } from '../router'
import { cloudProvider } from '../storage'
import type { Storage } from '../types'
import { tg } from '../telegram-web-app'


async function renderButtons() {
    function cleanButtons() {
        mainButton.hide().disable().offClick(navigateToCategories)
        secondaryButton.hide().disable().offClick(resetAndNavigateToCategories)
    }

    function navigateToCategories() {
        cleanButtons()
        renderPage('categories')
    }

    function resetAndNavigateToCategories() {
        cloudProvider().removeItem("festival").catch(error => {
            console.error(error)
        }).finally(() => {
            cleanButtons()
            renderPage('categories')
        })
    }

    const mainButton = tg.MainButton.setParams({
        text: 'Продолжить',
        color: '#364CA0',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    const secondaryButton = tg.SecondaryButton.setParams({
        text: 'Начать сначала',
        color: '#c9349e',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    mainButton.onClick(navigateToCategories)
    secondaryButton.onClick(resetAndNavigateToCategories)

    try {
        const data = await cloudProvider().getItem<Storage>('festival')

        if (!Object.keys(data).length) {
            throw new Error("No data found on festival")
        }

        mainButton.enable().show()
        secondaryButton.enable().show()
    } catch (error) {
        console.error(error)
        mainButton.setText('Начать!').enable().show()
    }
}

export default async function StartPage() {
    await renderButtons()
}
