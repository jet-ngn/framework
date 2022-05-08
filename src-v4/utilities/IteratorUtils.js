export function forEachKey (obj = {}, cb) {
  let keys = Object.keys(obj), i = 0, { length } = keys

  while (i < length) {
    const key = keys[i]
    const continueLoop = cb(keys[i], obj[key]) ?? true

    if (!continueLoop) {
      break
    }

    i++
  }
}