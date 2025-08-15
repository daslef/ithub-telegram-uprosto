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
    const tipText = 'Выберите интересующие вас категории'
    countCompletedCategories().then(numberCompleted => {
        statusElement.innerHTML = `${tipText} (заполнено: <span id="selected-count">${numberCompleted}</span>/${categories.length})`
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
    const buttonsElement = document.createElement('section')
    buttonsElement.className = 'buttons'

    const generateButtonElement = document.createElement('button')

    // exp
    const mainButton = tg.MainButton
    mainButton.setText('Сформировать пазл')
    mainButton.show()
    // exp

    countCompletedCategories().then(count => {
        generateButtonElement.disabled = count < categories.length
        // exp
        if (count < categories.length) {
            mainButton.disable()
        }
        // exp
    })

    generateButtonElement.classList.add('start__button', 'start__button--primary')
    generateButtonElement.textContent = 'Сформировать пазл'
    generateButtonElement.addEventListener('click', () => {
        cloudProvider()
            .getItem<Storage>('festival')
            .then(data => tg.sendData(JSON.stringify(data)))
            .catch(error => {
                console.error(error)
            })
    })

    const participateButtonElement = document.createElement('button')
    participateButtonElement.classList.add('start__button', 'start__button--secondary')
    participateButtonElement.textContent = 'Участвовать в розыгрыше'
    participateButtonElement.setAttribute('disabled', 'disabled')

    buttonsElement.append(generateButtonElement, participateButtonElement)
    return buttonsElement
}

export default function CategoriesPage() {
    const pageElement = document.createElement('article')

    const backToStartButton = tg.BackButton
    backToStartButton.onClick(() => renderPage('start'))
    backToStartButton.show()

    const h1Element = renderHeader()
    const statusElement = renderStatus()
    const categoriesElement = renderCategories()
    const menuElement = renderButtons()

    pageElement.append(h1Element, statusElement, categoriesElement, menuElement)

    return pageElement
}
