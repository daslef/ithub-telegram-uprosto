import { tg } from "../tg"
import { renderPage } from "../router"

export default function FormPage() {
    const formElement = document.createElement('form')
    formElement.className = 'test-form'

    const inputHeading = document.createElement('input')
    const inputDescription = document.createElement('input')
    const inputText = document.createElement('input')

    inputHeading.className = "title-inp"
    inputDescription.className = "desc-inp"
    inputText.className = "text-inp"

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


    formElement.append(inputHeading, inputDescription, inputText, buttonElement)

    return formElement
}