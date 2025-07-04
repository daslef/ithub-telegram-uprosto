import { renderPage } from '../router'
import { categories } from '../data'
import '../style.css'

function renderHeader() {
    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Электронный навигатор фестиваля'

    const descriptionWrapperElement = document.createElement('section')
    descriptionWrapperElement.className = 'game-description'

    const descriptionHeadingElement = document.createElement('h2')
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
    statusElement.innerHTML = `<h3>${tipText} (заполнено: <span id="selected-count">${(window as any).completed.length ?? 0}</span>/9)</h3>`

    return statusElement
}

function renderCategories() {
    const categoriesElement = document.createElement('section')
    categoriesElement.className = 'categories'

    for (const { category } of categories) {
        const buttonElement = document.createElement('button')
        buttonElement.disabled = (window as any).completed?.includes(category)
        buttonElement.classList.add('category')
        buttonElement.textContent = category
        buttonElement.addEventListener('click', () => {
            renderPage('form', category)
        })
        categoriesElement.appendChild(buttonElement)
    }
    return categoriesElement
}

function renderButtons() {
    const buttonsElement = document.createElement('section')
    buttonsElement.className = 'buttons'

    const generateButtonElement = document.createElement('button')
    generateButtonElement.classList.add('btn', 'btn-primary')
    generateButtonElement.textContent = 'Сформировать пазл'

    const participateButtonElement = document.createElement('button')
    participateButtonElement.classList.add('btn', 'btn-secondary')
    participateButtonElement.textContent = 'Участвовать в розыгрыше'

    buttonsElement.append(generateButtonElement, participateButtonElement)
    return buttonsElement
}

export default function StartPage() {
    const divElement = document.createElement('div')
    divElement.classList.add('Main', 'container')

    const [h1Element, descriptionWrapperElement] = renderHeader()
    const statusElement = renderStatus()
    const categoriesElement = renderCategories()
    const buttonsElement = renderButtons()

    divElement.append(h1Element, descriptionWrapperElement, statusElement, categoriesElement, buttonsElement)

    return divElement
}
