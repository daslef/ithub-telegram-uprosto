import menuSvg from '../assets/jigsaw.svg?raw'

import { renderPage } from '../router'
import { categories } from '../storage'
import { tg } from '../telegram-web-app';
import { cloudProvider } from '../storage';
import type { Storage } from '../types';

import '../style.css'

function countCompletedCategories(): Promise<number> {
    return new Promise((resolve) => {
        cloudProvider()
            .getItem<Storage>('festival')
            .then(data => resolve(Object.keys(data).length))
            .catch(error => {
                console.log(error)
                resolve(0)
            })
    })
}

function renderHeader() {
    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Собери свой образовательный пазл'

    return h1Element
}

function renderStatus() {
    const statusElement = document.createElement('h3')
    statusElement.innerHTML = "Выберите интересующие вас категории "

    countCompletedCategories().then(numberCompleted => {
        statusElement.innerHTML += `(заполнено: <span id="selected-count">${numberCompleted}</span>/${categories.length})`
    })

    return statusElement
}

function renderCategories() {
    const categoriesElement = document.createElement('section')
    categoriesElement.innerHTML = menuSvg
    categoriesElement.className = 'categories'

    const completedCategories: string[] = []
    cloudProvider().getItem<Storage>('festival').then(data => {
        completedCategories.push(...Object.keys(data))
    })

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

    return categoriesElement
}

function renderButtons() {
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

    backToStartButton.onClick(() => {
        tg.MainButton.hide()
        tg.SecondaryButton.hide()
        renderPage('start')
    })

    mainButton.onClick(() => {
        cloudProvider()
            .getItem<Storage>('festival')
            .then(data => tg.sendData(JSON.stringify(data)))
            .catch(error => {
                console.error(error)
            })
    })

    mainButton.show()
    secondaryButton.show()
    backToStartButton.show()

    countCompletedCategories().then(count => {
        if (count === categories.length) {
            mainButton.enable()
            secondaryButton.enable()
        }
    })

}

export default function CategoriesPage() {
    renderButtons()

    const pageElement = document.createElement('article')
    pageElement.append(renderHeader(), renderStatus(), renderCategories())

    return pageElement
}
