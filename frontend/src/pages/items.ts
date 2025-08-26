import { renderPage } from "../router"
import { categories, cloudProvider } from "../storage"
import { tg } from "../telegram-web-app";
import type { Storage, Company } from '../types';


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

function renderEntry(item: Company, checked = false) {
    const inputElement = document.createElement('input')
    inputElement.className = 'title-inp'
    inputElement.value = item.id
    inputElement.type = 'checkbox'
    inputElement.checked = checked

    const labelElement = document.createElement('label')
    labelElement.className = 'option'
    labelElement.textContent = item.title
    labelElement.prepend(inputElement)

    return labelElement
}

export default function FormPage(categoryName: string) {
    function navigateBack() {
        backToCategoriesButton.hide()
        backToCategoriesButton.offClick(navigateBack)
        renderPage("categories")
    }

    function onInput() {
        const button = formElement.querySelector('.form__button') as HTMLButtonElement
        const checkedNumber = getCheckedElements(formElement).filter(({ tagName }) => tagName === "INPUT").length
        button.disabled = checkedNumber === 0

        if (checkedNumber === 3) {
            for (const element of optionsElement.querySelectorAll('input:not(:checked)')) {
                element.setAttribute('disabled', 'disabled')
            }
        } else {
            for (const element of optionsElement.querySelectorAll('input')) {
                element.removeAttribute('disabled')
            }
        }
    }

    function onSubmit(event: SubmitEvent) {
        event.preventDefault()

        const commentElement = formElement.querySelector('.form__comment') as HTMLTextAreaElement
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
            })
            .finally(() => {
                renderPage('categories')
            })
    }

    const storage: Storage = {}

    const categoryData = categories.find(({ category }) => category === categoryName)
    const formElement = document.querySelector('.form') as HTMLFormElement
    const formHeading = document.querySelector(".form__heading") as HTMLHeadingElement
    const formButtonElement = document.querySelector('.form__button') as HTMLButtonElement
    const optionsElement = document.querySelector('.form__options') as HTMLDivElement

    formHeading.textContent = categoryName

    formElement.addEventListener('input', onInput)
    formElement.addEventListener("submit", onSubmit);

    onInput()

    const backToCategoriesButton = tg.BackButton
    backToCategoriesButton.show()
    backToCategoriesButton.onClick(navigateBack)

    const spinner = document.createElement('img')
    spinner.src = '/favicon.svg'
    spinner.className = 'spinner'
    formElement.appendChild(spinner)

    cloudProvider()
        .getItem<Storage>('festival')
        .then(value => {
            Object.assign(storage, value)
            console.log(storage)
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            spinner.remove()
            for (const item of categoryData!.items) {
                const isChecked = storage[categoryData!.id]?.items?.includes(item.id) ?? false
                optionsElement.prepend(renderEntry(item, isChecked))
            }
            (formElement.querySelector('.form__comment') as HTMLTextAreaElement).removeAttribute('hidden')
            formButtonElement.removeAttribute('hidden')
        })
}
