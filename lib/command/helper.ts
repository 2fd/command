export const TAB_SIZE = 4;

export function toString(obj: any): string {
    return Object.prototype.toString.call(obj);
}

export function repeat(str: string, len: number): string {

    let result = '';

    while (len > 0) {
        result += str;
        len--;
    }

    return result;
}



