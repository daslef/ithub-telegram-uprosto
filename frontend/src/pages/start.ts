import { renderPage } from '../router'
import { cloudProvider } from '../storage'
import type { Storage } from '../types'
import { tg } from '../telegram-web-app'
import '../style.css'


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

async function renderButtons() {
    const mainButton = tg.MainButton.setParams({
        text: '...',
        color: '#364CA0',
        text_color: '#ffffff',
        is_active: true,
        is_visible: false
    })

    mainButton.onClick(() => {
        renderPage('categories')
    })

    const secondaryButton = tg.SecondaryButton.setParams({
        text: '...',
        color: '#c9349e',
        text_color: '#ffffff',
        is_active: true,
        is_visible: false
    })

    try {
        const data = await cloudProvider().getItem<Storage>('festival')

        if (!Object.keys(data).length) {
            throw new Error("No data found on festival")
        }

        secondaryButton.onClick(() => {
            cloudProvider().removeItem("festival").catch(error => {
                console.error(error)
            }).finally(() => {
                renderPage('categories')
            })
        })

        mainButton.setText('Продолжить').show()
        secondaryButton.setText('Начать сначала').show()
    } catch (error) {
        console.error(error)
        mainButton.setText('Начать!').show()
    }
}

export default async function StartPage(): Promise<HTMLElement> {
    const pageElement = document.createElement('article')
    pageElement.append(...renderHeader())

    await renderButtons()
    return pageElement
}
