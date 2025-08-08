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
    formElement.className = 'form'

    const formHeading = document.createElement('h2')
    formHeading.textContent = categoryName
    formHeading.className = "form__heading"

    const divElement = document.createElement('section')
    divElement.className = "options"

    for (const item of categoryData!.items) {
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
        labelElement.className = 'option'
        labelElement.textContent = item.title
        labelElement.prepend(inputElement)

        divElement.appendChild(labelElement)
    }

    const buttonElement = document.createElement('button')
    buttonElement.classList.add('form__button')
    buttonElement.disabled = true
    buttonElement.textContent = 'Отправить'

    formElement.addEventListener("submit", (event) => {
        event.preventDefault()
        const values = getCheckedElements(formElement);
        console.log(event, values);
        (window as any).completed.push(categoryData?.id)

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


    formElement.append(formHeading, divElement, buttonElement)
    return formElement
}
