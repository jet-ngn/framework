export function escapeString (string) {
  const textarea = document.createElement('textarea')
  textarea.textContent = string
  return textarea.innerHTML
}

export function unescapeHTML (escapedHTML) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = escapedHTML
  return textarea.value.trim()
}

export function normalizeString (string) {
  return string.replace(/\r?\n|\r/g, '')
}

export function sanitizeString (string) {
  return escapeString(normalizeString(string))
}