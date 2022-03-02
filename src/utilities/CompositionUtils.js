export function compose (obj, ...extensions) {
  let { length } = extensions, i = 0

  while (i < length) {
    const extend = extensions[i]
    extend(obj)
    i++
  }

  return obj
}