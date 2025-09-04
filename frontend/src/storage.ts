import { type StateStorage } from 'zustand/middleware';
import { tg } from './telegram-web-app';

function timeout(ms = 5000): Promise<null> {
    return new Promise(reject => {
        setTimeout(() => {
            reject(null)
        }, ms)
    })
}

export { default as categories } from '../../data.json'

export const getCloudStorageProvider = (): StateStorage => {
    return {
        getItem: async (name: string) => {
            return await Promise.race([new Promise<string | null>((resolve, reject) => {
                tg.CloudStorage.getItem(name, (error, value) => {
                    if (error || !value || value === '') {
                        reject(null)
                    }

                    try {
                        resolve(JSON.parse(value as string))
                    } catch (error) {
                        reject(null)
                    }
                })
            }), timeout()])
        },
        setItem: async (name: string, value: string) => {
            return await Promise.race([new Promise<void>((resolve, reject) => {
                tg.CloudStorage.setItem(name, JSON.stringify(value), (error) => {
                    if (error) {
                        reject(new Error(`Error on writing data:\n${error}`))
                    }
                    resolve()
                })
            }), timeout()])
        },
        removeItem: async (name: string) => {
            return await Promise.race([new Promise<void>((resolve, reject) => {
                tg.CloudStorage.removeItem(name, (error, _) => {
                    if (error) {
                        reject(new Error(`Error on clear data:\n${error}`))
                    }
                    resolve()
                })
            }), timeout()])
        }
    }
}
