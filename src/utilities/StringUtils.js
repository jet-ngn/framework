export function escapeString (string) {
  const textarea = document.createElement('textarea')
  textarea.textContent = string
  return textarea.innerHTML
}

export function normalizeString (string) {
  return string.replace(/\r?\n|\r/g, '')
}

export function sanitizeString (string, { retainFormatting }) {
  return escapeString(retainFormatting ? string : normalizeString(string))
}