export function createId (type = 'nano') {
  switch (type) {
    case 'nano':
    case 'uuid':
    case 'guid': return NGN.DATA.util.GUID()

    default: return NGN.DATA.util.GUID()
  }
}

export function domContentLoadedHandler (cb) {
  let handler = function () {
    cb()
    document.removeEventListener('DOMContentLoaded', handler)
  }

  document.addEventListener('DOMContentLoaded', handler)
}

export function elementIsVisible (element, partial = false) {
  let rect = element.getBoundingClientRect()
  let visible = rect.bottom > 0 && rect.right > 0
  return partial ? visible : visible && rect.top > 0 && rect.left > 0
}

export function noop () {
  return function () {}
}
