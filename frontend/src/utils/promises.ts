import { tg } from "../telegram-web-app"

type Contact = RequestContactResponseSent["responseUnsafe"]["contact"]

export function requestContact(text: string): Promise<Contact> {
    return new Promise((resolve, reject) => {
        tg.showConfirm(text, (ok) => {
            if (!ok) {
                reject('Cancelled by user')
            }
            tg.requestContact((success, response) => {
                if (!success) {
                    reject('Cancelled by user')
                }
                resolve((response as RequestContactResponseSent).responseUnsafe.contact)
            })
        })
    })
}

export function showPopup(params: PopupParams): Promise<void> {
    return new Promise(resolve => {
        tg.showPopup(params, (_) => {
            resolve()
        })
    })
}
