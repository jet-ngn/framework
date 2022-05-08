export function escapeString (string) {
  const textarea = document.createElement('textarea')
  textarea.textContent = string
  return textarea.innerHTML
}

export function normalizeString (string) {
  return string.replace(/\r?\n|\r/g, '')
}

export function sanitizeString (string, options) {
  return escapeString(options?.retainFormatting === true ? string : normalizeString(string))
}