export function getPathSlugs (...slugs) {
  const result = []

  for (const slug of slugs) {
    result.push(...slug.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean))
  }

  return result
}