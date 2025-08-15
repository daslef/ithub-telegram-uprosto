import { renderPage } from "../router"
import { categories, cloudProvider } from "../storage"
import type { Storage } from '../types';
import '../style.css'


function getCheckedElements(formElement: HTMLFormElement) {
    return [...formElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')]
        .filter((inputElement) => {
            if (inputElement.tagName === "INPUT") {
                return (inputElement as HTMLInputElement).checked
            } else if (inputElement.tagName === "TEXTAREA") {
                return (inputElement as HTMLTextAreaElement).value?.length > 3
            }
        })
}

export default function FormPage(categoryName: string) {
    function onInput() {
        const button = formElement.querySelector('button')
        const checkedNumber = getCheckedElements(formElement).filter(({ tagName }) => tagName === "INPUT").length
        button!.disabled = checkedNumber === 0

        if (checkedNumber === 3) {
            for (const element of divElement.querySelectorAll('input:not(:checked)')) {
                element.setAttribute('disabled', 'disabled')
            }
        } else {
            for (const element of divElement.querySelectorAll('input')) {
                element.removeAttribute('disabled')
            }
        }
    }

    const storage: Storage = {}

    cloudProvider()
        .getItem<Storage>('festival')
        .then(value => {
            Object.assign(storage, value)
            console.log(storage)
        })
        .catch(error => {
            console.error(error)
        })

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
        inputElement.checked = storage[categoryData!.id]?.items?.includes(item.id) ?? false
        inputElement.addEventListener('input', onInput)

        const labelElement = document.createElement('label')
        labelElement.className = 'option'
        labelElement.textContent = item.title
        labelElement.prepend(inputElement)

        divElement.appendChild(labelElement)
    }

    const comments = document.createElement('textarea')
    comments.className = "form__comments"
    comments.rows = 5
    comments.placeholder = "Не хватило? Оставьте комментарий!"
    comments.className = "form__comment"
    comments.addEventListener('input', onInput)
    divElement.append(comments)

    const buttonElement = document.createElement('button')
    buttonElement.classList.add('form__button')
    buttonElement.disabled = true
    buttonElement.textContent = 'Отправить'

    formElement.addEventListener("submit", (event) => {
        event.preventDefault()

        const commentElement = formElement.querySelector('textarea')
        const commentValue = commentElement?.value && commentElement.value.length > 3 ? commentElement.value : ""
        const itemsValue = getCheckedElements(formElement).filter(({ tagName }) => tagName === "INPUT").map(({ value }) => value);

        cloudProvider()
            .setItem<Storage>('festival', {
                ...storage,
                [categoryData!.id]: {
                    items: itemsValue,
                    comment: commentValue
                }
            })
            .catch(error => {
                console.log(error)
            });

        renderPage('categories')
    });


    formElement.append(formHeading, divElement, buttonElement)
    return formElement
}
