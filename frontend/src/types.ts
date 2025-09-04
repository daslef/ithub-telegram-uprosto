export type LotteryDatetime = {
    date: string | null,
    time: string | null,
}

export type Credentials = {
    first_name: string | null,
    last_name?: string | null,
    phone_number: string | null
}

export type LotteryStorage = LotteryDatetime

export type PuzzleItem = {
    items: string[],
    comment?: string
}

export type CategoryId = string

export type CompanyInfo = {
    id: string,
    title: string,
    contacts: string
}

export type PuzzleStorage = { [K: CategoryId]: PuzzleItem }

export type PuzzleDTO = {
    type: 'puzzle',
    payload: PuzzleStorage,
    credentials?: Credentials
}
