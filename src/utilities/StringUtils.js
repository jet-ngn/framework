const textarea = document.createElement('textarea')

export function escapeString (string) {
  textarea.textContent = string
  const output = textarea.innerHTML
  textarea.innerHTML = ''
  return output
}

export function normalizeString (string) {
  return string.replace(/\r?\n|\r/g, '')
}

export function sanitizeString (string, { retainFormatting }) {
  return escapeString(retainFormatting ? string : normalizeString(string))
}