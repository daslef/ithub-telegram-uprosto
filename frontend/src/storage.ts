import { tg } from './telegram-web-app';

export function cloudProvider() {
    function setItem<T>(name: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            tg.CloudStorage.setItem(name, JSON.stringify(value), (error) => {
                if (error) {
                    reject(`Error on writing data:\n${error}`)
                }
            })
            resolve()
        })
    }

    function getItem<T>(name: string): Promise<T> {
        return new Promise((resolve, reject) => {
            tg.CloudStorage.getItem(name, (error, value) => {
                if (error) {
                    reject(`Error on getting data:\n${error}`)
                }

                if (value === null || value === '') {
                    reject(`No value found for ${name}`)
                }

                resolve(JSON.parse(value as string))
            })
        })
    }

    function clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            tg.CloudStorage.getKeys((error, keys) => {
                if (error) {
                    reject(`Error on clear data:\n${error}`)
                }

                if (!keys) {
                    reject("No keys found in storage")
                }

                tg.CloudStorage.removeItems(keys ?? [], (error, _) => {
                    if (error) {
                        reject(`Error on clear data:\n${error}`)
                    }
                    resolve()
                })
            })
        })
    }

    return {
        setItem,
        getItem,
        clear
    }
}

export { default as categories } from '../../data.json'
