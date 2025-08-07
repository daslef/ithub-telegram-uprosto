import { tg } from "../telegram-web-app"
import { renderPage } from "../router"
import { categories } from "../data"
import '../style.css'


function getCheckedElements(formElement: HTMLFormElement) {
    return [...formElement.querySelectorAll('input')].filter(inputElement => inputElement.checked).map(({ value }) => value)
}

export default function FormPage(categoryName: string) {
    const storage: string[] = []

    try {
        tg.CloudStorage.getItem('festival', (error, value) => {
            if (error) {
                throw new Error(error)
            }
            if (value === null || value === '') {
                throw new Error("No value received")
            }

            console.log(value, JSON.parse(value))
            return storage.push(...JSON.parse(value))
        })
    } catch (error) {
        console.error(error)
    }

    console.log(storage)

    const categoryData = categories.find(({ category }) => category === categoryName)

    const formElement = document.createElement('form')
    formElement.className = 'modal-content'

    const divElement = document.createElement('section')
    divElement.className = "options"

    for (const item of categoryData!.items) {
        const wrapperElement = document.createElement('section')
        wrapperElement.className = ''

        const inputElement = document.createElement('input')
        inputElement.className = 'title-inp'
        inputElement.value = item.id
        inputElement.type = 'checkbox'
        inputElement.checked = storage?.includes(item.id)
        inputElement.addEventListener('input', () => {
            const button = formElement.querySelector('button')
            button!.disabled = getCheckedElements(formElement).length < 3
        })

        const labelElement = document.createElement('label')
        labelElement.textContent = item.title

        wrapperElement.append(inputElement, labelElement)
        divElement.appendChild(wrapperElement)
    }

    const buttonElement = document.createElement('button')
    buttonElement.classList.add('btn', 's-btn')
    buttonElement.disabled = true
    buttonElement.textContent = 'Отправить'

    formElement.addEventListener("submit", (event) => {
        event.preventDefault()
        const values = getCheckedElements(formElement);
        console.log(event, values);
        (window as any).completed.push(categoryName)

        try {
            tg.CloudStorage.setItem('festival', JSON.stringify([...storage, values]), (error) => {
                if (error) {
                    throw new Error(`Error on writing data ${error}`)
                }
            })
        } catch (error) {
            console.error(error)
        }
        renderPage('start')
    });


    formElement.append(divElement, buttonElement)
    return formElement
}
