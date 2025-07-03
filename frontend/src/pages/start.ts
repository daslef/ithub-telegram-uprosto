import sheepImg from '../assets/closeup-shot-sheep.avif'
import { renderPage } from '../router'
import { categories } from '../data'

export default function StartPage() {
    const divElement = document.createElement('div')
    divElement.className = 'Main'

    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Стартовая'

    const imgElement = document.createElement('img')
    imgElement.className = 'main-image'
    imgElement.src = sheepImg


    const sectionElement = document.createElement('section')
    sectionElement.className = ''

    for (const {category} of categories) {
        const buttonElement = document.createElement('button')
        buttonElement.classList.add('category')
        buttonElement.textContent = category
        buttonElement.addEventListener('click', () => {
            renderPage('form', category)
        })
        sectionElement.appendChild(buttonElement)
    }


    divElement.append(h1Element, imgElement, sectionElement)

    return divElement
}