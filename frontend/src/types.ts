export type Storage = { [K: string]: { items: string[], comment?: string } }
export type StorageLottery = {
    date: string,
    time: string,
    first_name: string,
    last_name: string,
    phone_number: string
}

export type Company = {
    id: string,
    title: string,
    contacts: string
}
