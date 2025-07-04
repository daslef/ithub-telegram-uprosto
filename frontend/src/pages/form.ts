import { tg } from "../tg"
import { renderPage } from "../router"
import { categories } from "../data"

function getCheckedElements(formElement: HTMLFormElement) {
    const inputs = [...formElement.querySelectorAll('input')].filter(inputElement => inputElement.checked).map(({ value }) => value)
    return inputs
}

export default function FormPage(categoryName: string) {
    const categoryData = categories.find(({category}) => category === categoryName)

    const formElement = document.createElement('form')
    formElement.className = 'test-form'

    const divElement = document.createElement('div')
    for (const item of categoryData!.items) {
        const wrapperElement = document.createElement('section')
        wrapperElement.className = ''


        const inputElement = document.createElement('input')
        inputElement.className = 'title-inp'
        inputElement.value = item.id
        inputElement.type = 'checkbox'
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
        const values = getCheckedElements(formElement)
        
        tg.CloudStorage.setItem('data', values, (error: Error) => {
            if (error) {
                console.log('Error on writing data', error)
            }
            renderPage('start')
        })

        // const data = {
        //     title: title.value,
        //     desc: description.value,
        //     text: text.value
        // }

        // tg.sendData(JSON.stringify(data));

        // renderPage('start')
    });


    formElement.append(divElement, buttonElement)

    return formElement
}