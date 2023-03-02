import WorkerSubject from './WorkerSubject'

export const DATA_WORKER = new WorkerSubject(new Worker(new URL('./jet/DataWorker.js', import.meta.url), { name: 'Jet Data Worker' })),
             ROUTE_WORKER = new WorkerSubject(new Worker(new URL('./jet/RouteWorker.js', import.meta.url), { name: 'Jet Route Worker' })),
      
             APPS = new Map,
             BINDINGS = new Map,
             TEMPLATES = new Map