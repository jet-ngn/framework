export function compose (obj, ...extensions) {
  let { length } = extensions, i = 0

  while (i < length) {
    extensions[i](obj)
    i++
  }

  return obj
}