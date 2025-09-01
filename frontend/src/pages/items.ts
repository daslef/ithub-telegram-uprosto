import { renderPage } from "../router"
import { categories } from "../storage"
import { tg } from "../telegram-web-app";
import { usePuzzleStore } from "../store/puzzle";
import type { CompanyInfo } from '../types';


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

function renderEntry(item: CompanyInfo, checked = false) {
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
        tg.BackButton.offClick(navigateBack)
        renderPage("categories")
    }

    function onInput() {
        const checkedNumber = getCheckedElements(formElement).length

        if (checkedNumber > 0) {
            tg.MainButton.show().enable()
        } else {
            tg.MainButton.hide().disable()
        }

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

    function onSubmit() {
        const commentElement = formElement.querySelector('.form__comment') as HTMLTextAreaElement
        const commentValue = commentElement?.value && commentElement.value.length > 3 ? commentElement.value : ""
        const itemsValue = getCheckedElements(formElement).filter(({ tagName }) => tagName === "INPUT").map(({ value }) => value);

        try {
            usePuzzleStore.getState().updateItemById(categoryData!.id, {
                items: itemsValue,
                comment: commentValue
            })
        } catch (error) {
            console.log(error)
        }

        tg.MainButton.offClick(onSubmit)
        renderPage('categories')
    }

    const categoryData = categories.find(({ category }) => category === categoryName)
    const formElement = document.querySelector('.form') as HTMLFormElement
    const formHeading = formElement.querySelector(".form__heading") as HTMLHeadingElement
    const optionsElement = formElement.querySelector('.form__options') as HTMLDivElement
    const commentElement = formElement.querySelector('.form__comment')
    const spinnerElement = formElement.querySelector('.spinner')


    formHeading.textContent = categoryName

    formElement.addEventListener('input', onInput)

    tg.SecondaryButton.hide()
    tg.BackButton.onClick(navigateBack).show()
    tg.MainButton.setText("Отправить").onClick(onSubmit).hide()

    const categoryStorage = usePuzzleStore.getState().getItemById(categoryData!.id)

    spinnerElement?.classList.add('hidden')

    for (const item of categoryData!.items) {
        const isChecked = categoryStorage?.items?.includes(item.id) ?? false
        optionsElement.prepend(renderEntry(item, isChecked))
    }

    commentElement?.removeAttribute('hidden')

    onInput()
}
