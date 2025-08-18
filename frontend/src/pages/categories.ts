import { renderPage } from '../router'
import { categories } from '../storage'
import { tg } from '../telegram-web-app';
import { cloudProvider } from '../storage';
import type { Storage } from '../types';

function getCompletedCategories(): Promise<string[]> {
    return new Promise((resolve) => {
        cloudProvider()
            .getItem<Storage>('festival')
            .then(data => resolve(Object.keys(data)))
            .catch(error => {
                console.log(error)
                resolve([])
            })
    })
}

function renderStatus(completedCount: number) {
    const statusElement = document.querySelector('.game-status > span')!
    statusElement.innerHTML = `(заполнено: ${completedCount}/${categories.length})`
}

function renderCategories(completedCategories: string[]) {
    const categoriesElement = document.querySelector('.categories')!

    for (const { id, category } of categories) {
        const buttonElement = categoriesElement.querySelector(`#${id}`)!
        buttonElement.classList.add('category')
        const iconDone = buttonElement.querySelector('.icon-done')!

        if (completedCategories.includes(id)) {
            buttonElement.classList.add('disabled')
            iconDone.classList.add('show')
        }

        for (const child of buttonElement.children) {
            child.addEventListener('click', () => {
                renderPage('items', category)
            })
        }
    }
}

function renderButtons(completedCount: number) {
    function cleanButtons() {
        backToStartButton.hide()
        backToStartButton.offClick(navigateBack)
        mainButton.hide().disable().offClick(sendPuzzleData)
        secondaryButton.hide().disable().offClick(navigateToLottery)
    }

    function navigateBack() {
        cleanButtons()
        renderPage('start')
    }

    function navigateToLottery() {
        cleanButtons()
        return
    }

    function sendPuzzleData() {
        cloudProvider()
            .getItem<Storage>('festival')
            .then(data => tg.sendData(JSON.stringify(data)))
            .catch(error => {
                console.error(error)
            })
            .finally(() => {
                cleanButtons()
            })
    }

    const mainButton = tg.MainButton.setParams({
        text: 'Сформировать пазл',
        color: '#364CA0',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    const secondaryButton = tg.SecondaryButton.setParams({
        text: 'Участвовать в розыгрыше',
        color: '#c9349e',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false,
        position: "bottom"
    })

    const backToStartButton = tg.BackButton

    backToStartButton.onClick(navigateBack)
    mainButton.onClick(sendPuzzleData)
    secondaryButton.onClick(navigateToLottery)

    mainButton.show()
    secondaryButton.show()
    backToStartButton.show()

    if (completedCount === categories.length) {
        mainButton.enable()
        secondaryButton.enable()
    }
}

export default async function CategoriesPage() {
    const completedCategories = await getCompletedCategories()

    renderStatus(completedCategories.length)
    renderButtons(completedCategories.length)
    renderCategories(completedCategories)
}
