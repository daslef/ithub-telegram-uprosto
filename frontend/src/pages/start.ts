import sheepImg from '../assets/closeup-shot-sheep.avif'
import { renderPage } from '../router'

export default function StartPage() {
    const divElement = document.createElement('div')
    divElement.className = 'Main'

    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Стартовая'

    const imgElement = document.createElement('img')
    imgElement.className = 'main-image'
    imgElement.src = sheepImg

    const buttonElement = document.createElement('button')
    buttonElement.classList.add('btn', 'f-btn')
    buttonElement.textContent = 'Тест отправки'
    buttonElement.addEventListener('click', () => {
        renderPage('form')
    })

    divElement.append(h1Element, imgElement, buttonElement)

    return divElement
}