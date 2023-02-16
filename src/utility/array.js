export function map (arr, cb) {
  const { length } = arr,
        result = new Array(length),
        i = length

  for (let i = 0; i < length; ++i) {
    result[i] = cb(arr[i], i)
  }

  return result
}