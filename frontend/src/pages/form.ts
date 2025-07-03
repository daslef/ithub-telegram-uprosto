import { tg } from "../tg"
import { renderPage } from "../router"
import { categories } from "../data"

export default function FormPage(categoryName: string) {
    const categoryData = categories.find(({category}) => category === categoryName)

    const formElement = document.createElement('form')
    formElement.className = 'test-form'

    const divElement = document.createElement('div')
    for (const item of categoryData!.items) {
        const inputElement = document.createElement('input')
        inputElement.className = 'title-inp'
        inputElement.placeholder = item.title
        divElement.appendChild(inputElement)
    }


    const buttonElement = document.createElement('button')
    buttonElement.classList.add('btn', 's-btn')
    buttonElement.textContent = 'Отправить'

    buttonElement.addEventListener("click", () => {
        const title = document.querySelector(".title-inp") as HTMLInputElement;
        const description = document.querySelector(".desc-inp") as HTMLInputElement;
        const text = document.querySelector(".text-inp") as HTMLInputElement;

        const data = {
            title: title.value,
            desc: description.value,
            text: text.value
        }

        tg.sendData(JSON.stringify(data));
        renderPage('end')
    });


    formElement.append(divElement, buttonElement)

    return formElement
}