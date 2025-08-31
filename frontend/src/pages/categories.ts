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
    tg.BackButton.offClick(navigateBack).hide()
    tg.MainButton.hide().disable().offClick(sendPuzzleData)
    tg.SecondaryButton.hide().disable().offClick(navigateToLottery)
}

function navigateBack() {
    cleanButtons()
    renderPage('start')
}

function navigateToLottery() {
    cleanButtons()
    renderPage("lottery")
}

function sendPuzzleData() {
    cloudProvider()
        .getItem<Storage>('festival')
        .then(payload => tg.sendData(JSON.stringify({ type: 'puzzle', payload })))
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            cleanButtons()
        })
}


function renderButtons(completedCount: number) {
    tg.MainButton.setParams({
        text: 'Сформировать пазл',
        color: '#FF9448',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false
    })

    tg.SecondaryButton.setParams({
        text: 'Участвовать в розыгрыше',
        color: '#9C8CD9',
        text_color: '#ffffff',
        is_active: false,
        is_visible: false,
        position: "bottom"
    })

    tg.BackButton.onClick(navigateBack).show()
    tg.MainButton.onClick(sendPuzzleData)
    tg.SecondaryButton.onClick(navigateToLottery)

    if (completedCount === categories.length) {
        tg.MainButton.enable().show()
        tg.SecondaryButton.enable().show()
    }
}

export default async function CategoriesPage() {
    const completedCategories = await getCompletedCategories()

    renderStatus(completedCategories.length)
    renderButtons(completedCategories.length)
    renderCategories(completedCategories)
}
