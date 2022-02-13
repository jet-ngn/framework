export function compose (obj, ...extensions) {
  let { length } = extensions, i = 0

  while (i < length) {
    const extend = extensions[i]
    extend(obj)
    i++
  }

  return obj
}

// export function forEach (arr = [], cb) {
//   let { length } = arr, i = 0

//   while (i < length) {
//     cb(arr[i], arr)
//     i++
//   }
// }

export function forEachKey (obj = {}, cb) {
  let keys = Object.keys(obj), i = 0, { length } = keys

  while (i < length) {
    const key = keys[i]
    cb(keys[i], obj[key])
    i++
  }
}

// // export function mapObject (obj, transform) {
// //   let keys = Object.keys(obj), i = 0
// //   let mapped = {}

// //   while (i < keys.length) {
// //     const key = keys[i]
// //     mapped[key] = transform(key, obj[key])
// //     i++
// //   }

// //   return mapped
// // }