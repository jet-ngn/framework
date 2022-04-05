const textarea = document.createElement('textarea')

export function escapeString (string) {
  textarea.innerHTML = ''
  textarea.textContent = string
  return textarea.innerHTML
}

export function normalizeString (string) {
  return string.replace(/\r?\n|\r/g, '')
}

export function stripExtraSpaces (string) {
  return string.replace(/\s+/g,' ').trim()
}

export function sanitizeString (string, options) {
  return escapeString(options?.retainFormatting === true ? string : normalizeString(string))
}