import menuSvg from '../assets/jigsaw.svg?raw'

import { renderPage } from '../router'
import { categories } from '../data'
import { tg } from '../telegram-web-app'
import '../style.css'

function renderHeader() {
    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Электронный навигатор фестиваля'

    const descriptionWrapperElement = document.createElement('section')
    descriptionWrapperElement.className = 'game-description'

    const descriptionHeadingElement = document.createElement('p')
    descriptionHeadingElement.textContent = 'ИГРА: Собери свой образовательный пазл'

    const descriptionContentElement = document.createElement('p')
    descriptionHeadingElement.innerHTML = `Образование — это пазл. Каждый фрагмент которого отражает определённое направление развития ребёнка.
        Каждый ребёнок — уникален, и его путь в образовании складывается как пазл из его интересов, опыта, предпочтений, увлечений, целей.
        У каждого — свой путь: кто - то начнёт с творчества, кто - то — с IT или спорта. Собирайте собственную «образовательную картину»
        из фрагментов, которые отражают те области, что откликаются именно вам.Не обязательно проходить все стенды, можно выбирать только интересные области.`

    descriptionWrapperElement.append(descriptionHeadingElement, descriptionContentElement)

    return [h1Element, descriptionWrapperElement]
}

function renderStatus() {
    const statusElement = document.createElement('h3')
    const tipText = 'Выберите интересующие вас категории'
    statusElement.innerHTML = `${tipText} (заполнено: <span id="selected-count">${(window as any).completed.length ?? 0}</span>/${categories.length})`

    return statusElement
}

function renderCategories() {
    const categoriesElement = document.createElement('section')
    categoriesElement.innerHTML = menuSvg
    categoriesElement.className = 'categories'

    for (const { id, category } of categories) {
        const buttonElement = categoriesElement.querySelector(`#${id}`)!
        buttonElement.classList.add('category')
        const iconDone = buttonElement.querySelector('.icon-done')!

        if ((window as any).completed?.includes(id)) {
            buttonElement.classList.add('disabled')
            iconDone.classList.add('show')
        }

        for (const child of buttonElement.children) {
            child.addEventListener('click', () => {
                renderPage('form', category)
            })
        }
    }

    return categoriesElement
}

function renderButtons() {
    const buttonsElement = document.createElement('section')
    buttonsElement.className = 'buttons'

    const generateButtonElement = document.createElement('button')
    generateButtonElement.disabled = (window as any).completed.length < categories.length
    generateButtonElement.classList.add('start__button', 'start__button--primary')
    generateButtonElement.textContent = 'Сформировать пазл'
    generateButtonElement.addEventListener('click', () => {
        try {
            tg.CloudStorage.getItem('festival', (error, value) => {
                if (error) {
                    throw new Error(error)
                }
                if (value === null || value === '') {
                    throw new Error("No value received")
                }

                tg.sendData(value);
            })
        } catch (error) {
            console.error(error)
        }
    })

    const participateButtonElement = document.createElement('button')
    participateButtonElement.classList.add('start__button', 'start__button--secondary')
    participateButtonElement.textContent = 'Участвовать в розыгрыше'
    participateButtonElement.setAttribute('disabled', 'disabled')

    buttonsElement.append(generateButtonElement, participateButtonElement)
    return buttonsElement
}

export default function StartPage() {
    const pageElement = document.createElement('article')

    const [h1Element, descriptionWrapperElement] = renderHeader()
    const statusElement = renderStatus()
    const categoriesElement = renderCategories()
    const menuElement = renderButtons()

    pageElement.append(h1Element, descriptionWrapperElement, statusElement, categoriesElement, menuElement)

    return pageElement
}
