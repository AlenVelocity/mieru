export function rindex(arr: string[], item: string): number {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === item) {
            return i
        }
    }
    return -1
}

export * from './fs'
