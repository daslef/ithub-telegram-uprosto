export function isTimestampPassed(timestamp: number) {
    return Date.now() > timestamp
}

export function isDatetimePassed(date: string, time: string) {
    return Date.now() > Date.parse(`${date}T${time}`)
}

export function isDatePassed(date: string) {
    const currentDate = new Date().setHours(0, 0, 0)
    return currentDate > Date.parse(date)
}
