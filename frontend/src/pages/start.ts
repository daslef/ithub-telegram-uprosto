import { renderPage } from '../router'
import { cloudProvider } from '../storage'
import type { Storage } from '../types'
import { tg } from '../telegram-web-app'


async function renderButtons() {
    function cleanButtonHandlers() {
        mainButton.offClick(navigateToCategories)
        secondaryButton.offClick(resetAndNavigateToCategories)
    }

    function navigateToCategories() {
        cleanButtonHandlers()
        renderPage('categories')
    }

    function resetAndNavigateToCategories() {
        cloudProvider().removeItem("festival").catch(error => {
            console.error(error)
        }).finally(() => {
            cleanButtonHandlers()
            renderPage('categories')
        })
    }

    const mainButton = tg.MainButton.setParams({
        text: 'Продолжить',
        color: '#364CA0',
        text_color: '#ffffff',
        is_active: true,
        is_visible: false
    })

    const secondaryButton = tg.SecondaryButton.setParams({
        text: 'Начать сначала',
        color: '#c9349e',
        text_color: '#ffffff',
        is_active: true,
        is_visible: false
    })

    mainButton.onClick(navigateToCategories)
    secondaryButton.onClick(resetAndNavigateToCategories)

    try {
        const data = await cloudProvider().getItem<Storage>('festival')

        if (!Object.keys(data).length) {
            throw new Error("No data found on festival")
        }

        mainButton.show()
        secondaryButton.show()
    } catch (error) {
        console.error(error)
        mainButton.setText('Начать!').show()
    }
}

export default async function StartPage() {
    await renderButtons()
}
