import { tg } from './telegram-web-app';

function timeout(ms = 3000): Promise<Error> {
    return new Promise(reject => {
        setTimeout(() => {
            reject(new Error('Timeout exceeded on trying get data'))
        }, ms)
    })
}

export function cloudProvider() {
    function setItem<T>(name: string, value: T): Promise<void | Error> {
        const setPromise: Promise<void> = new Promise((resolve, reject) => {
            tg.CloudStorage.setItem(name, JSON.stringify(value), (error) => {
                if (error) {
                    reject(new Error(`Error on writing data:\n${error}`))
                }
                resolve()
            })
        })

        return Promise.race([setPromise, timeout()])
    }

    function getItem<T>(name: string): Promise<T | Error> {
        const getPromise: Promise<T> = new Promise((resolve, reject) => {
            tg.CloudStorage.getItem(name, (error, value) => {
                if (error) {
                    reject(new Error(`Error on getting data:\n${error}`))
                }

                if (!value || value === '') {
                    reject(new Error(`No value found for ${name}`))
                }

                try {
                    resolve(JSON.parse(value as string))
                } catch (error) {
                    reject(new Error(`Error on parsing gotten data: \n${error}`))
                }
            })
        })

        return Promise.race([getPromise, timeout()])
    }

    function removeItem(name: string): Promise<void | Error> {
        const removePromise: Promise<void> = new Promise((resolve, reject) => {
            tg.CloudStorage.removeItem(name, (error, _) => {
                if (error) {
                    reject(new Error(`Error on clear data:\n${error}`))
                }
                resolve()
            })
        })

        return Promise.race([removePromise, timeout()])
    }

    return {
        setItem,
        getItem,
        removeItem
    }
}

export { default as categories } from '../../data.json'
