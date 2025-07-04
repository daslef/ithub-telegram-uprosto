import '../style.css'

export default function EndPage() {
    const divElement = document.createElement('div')
    divElement.className = 'Main'

    const h1Element = document.createElement('h1')
    h1Element.textContent = "Успешно"

    divElement.append(h1Element)

    return divElement
}