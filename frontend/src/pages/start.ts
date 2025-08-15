import { renderPage } from '../router'
import { cloudProvider } from '../storage'
import '../style.css'

type Action = 'start' | 'continue' | 'reset'

function renderHeader() {
    const h1Element = document.createElement('h1')
    h1Element.textContent = 'Собери свой образовательный пазл'

    const descriptionWrapperElement = document.createElement('section')
    descriptionWrapperElement.className = 'game-description'

    const descriptionContentElement = document.createElement('p')
    descriptionContentElement.innerHTML = `Образование — это пазл. Каждый фрагмент которого отражает определённое направление развития ребёнка. Каждый ребёнок — уникален, и его путь в образовании складывается как пазл из его интересов, опыта, предпочтений, увлечений, целей. У каждого — свой путь: кто-то начнёт с творчества, кто-то — с IT или спорта.
<br/><br/>Собирайте собственную «образовательную картину» из фрагментов, которые отражают те области, что откликаются именно вам. Не обязательно проходить все стенды, можно выбирать только интересные области.
<br/><br/>Образовательный пазл в нашей игре – это концепция образования вашего ребенка, которую мы предлагаем вам собрать в единую картинку, знакомясь с участниками фестиваля. В каждой категории можно выбрать до трёх организаций.
<br/><br/>Желаем вам найти интересные и подходящие вам «пазлики» среди экспонентов, а если останутся свободные пазлы, впишите туда то, чего вам не хватает для полной картинки.
<br/><br/>Каждый полностью заполнивший пазл может принять участие в розыгрыше подарков, который состояться в 13:50, 15:50 и 17:50 в каждый из дней Фестиваля.
`
    descriptionWrapperElement.append(descriptionContentElement)

    return [h1Element, descriptionWrapperElement]
}

function renderButtons() {
    function generateButton(text: string, className: string, action: Action) {
        const buttonElement = document.createElement('button')
        buttonElement.classList.add('start__button', className)
        buttonElement.textContent = text
        buttonElement.addEventListener('click', () => {
            if (action === "reset") {
                cloudProvider().clear().finally(() => {
                    renderPage('categories')
                })
            }
            renderPage('categories')
        })
        return buttonElement
    }

    const buttonsElement = document.createElement('section')
    buttonsElement.className = 'buttons'

    const storage = cloudProvider().getItem('festival')
    if (Object.keys(storage).length) {
        buttonsElement.append(
            generateButton('Продолжить', 'start__button--primary', 'continue'),
            generateButton('Начать сначала', 'start__button--secondary', 'continue'),
        )
    } else {
        buttonsElement.appendChild(generateButton('Начать!', 'start__button--primary', 'start'))
    }

    return buttonsElement
}

export default function StartPage() {
    const pageElement = document.createElement('article')

    const [h1Element, descriptionWrapperElement] = renderHeader()
    const buttonsElement = renderButtons()

    pageElement.append(h1Element, descriptionWrapperElement, buttonsElement)

    return pageElement
}
