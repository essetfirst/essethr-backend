export const arrayMap = (array: any[], callback: any) => {
    let index = -1;
    const length = array == null ? 0 : array.length;
    const result = new Array(length);

    while (++index < length) {
        result[index] = callback(array[index], index, array);
    }
    return result;
}


