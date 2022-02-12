export function compose (obj, ...objs) {
  let length = objs.length, i = 0

  while (i < length) {
    forEachKey(objs[i], (key, value) => obj[key] = value)
    console.log(objs[i]);
    i++
  }
}

export function forEach (arr = [], cb) {
  let length = arr.length, i = 0

  while (i < length) {
    cb(arr[i], arr)
    i++
  }
}

export function forEachKey (obj = {}, cb) {
  let keys = Object.keys(obj), i = 0

  while (i < keys.length) {
    const key = keys[i]
    cb(keys[i], obj[key])
    i++
  }
}