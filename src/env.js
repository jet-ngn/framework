import WorkerObserver from './WorkerObserver'

export const DATA_WORKER = new WorkerObserver(new Worker(new URL('./jet/DataWorker.js', import.meta.url), { name: 'Jet Data Worker' }))
export const ROUTE_WORKER = new WorkerObserver(new Worker(new URL('./jet/RouteWorker.js', import.meta.url), { name: 'Jet Route Worker' }))
export const APPS = new Map