import { tg } from "../telegram-web-app"
import { renderPage } from "../router"
import { categories } from "../data"
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

    const storage: string[] = []
    const storage_comments: string[] = []

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

    try {
        tg.CloudStorage.getItem('festival_comments', (error, value) => {
            if (error) {
                throw new Error(error)
            }
            if (value === null || value === '') {
                throw new Error("No value received")
            }

            console.log(value, JSON.parse(value))
            return storage_comments.push(...JSON.parse(value))
        })
    } catch (error) {
        console.error(error)
    }


    console.log(storage, storage_comments)

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
        const values = getCheckedElements(formElement).filter(({ tagName }) => tagName === "INPUT").map(({ value }) => value);
        const comment = formElement.querySelector('textarea')
        if (comment?.value && comment.value.length > 3) {
            try {
                tg.CloudStorage.setItem('festival_comments', JSON.stringify([...storage_comments, comment.value]), (error) => {
                    if (error) {
                        throw new Error(`Error on writing data ${error}`)
                    }
                })
            } catch (error) {
                console.error(error)
            }
        }

        console.log(event, values, comment?.value);
        (window as any).completed.push(categoryData?.id)

        try {
            tg.CloudStorage.setItem('festival', JSON.stringify([...storage, { [categoryData!.id]: values }]), (error) => {
                if (error) {
                    throw new Error(`Error on writing data ${error}`)
                }
            })
        } catch (error) {
            console.error(error)
        }

        renderPage('categories')
    });


    formElement.append(formHeading, divElement, buttonElement)
    return formElement
}
