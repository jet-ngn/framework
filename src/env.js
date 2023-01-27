export const DATA = new Worker(new URL('./workers/DATA.js', import.meta.url))
export const ROUTER = new Worker(new URL('./workers/ROUTER.js', import.meta.url))
export const VIEWS = new Map