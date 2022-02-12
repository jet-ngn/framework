import NGN from 'NGN'
import { forEachKey } from './utilities.js'

class EventManager {
  #events = {}
}

export function applyEventHandlers (target, cfg) {
  forEachKey(cfg, (evt, handler) => target.on(evt, handler))
}

export const attachEventManager = obj => {
  const manager = new EventManager()
  // Object.defineProperty(obj, NGN.privateconst())

  Object.assign(obj.prototype, {
    emit (evt, ...args) {
      NGN.BUS.emit(...arguments)
    },

    on (evt, cb) {
      NGN.BUS.on(...arguments)
    },

    off () {

    }
  })

  return obj
}

// import { forEachKey } from './utilities.js.js'

// const getNamespacedEvent = (namespace, evt) => `${namespace}.${evt}`

// // This class adds functionality to the NGN Event Handler.
// // Some of it should be considered for integration into NGN.
// class EventHandler {
//   #id = Symbol()
  
//   #event
//   #callback

//   #minCalls
//   #maxCalls
//   #maxExecutions
//   #interval
//   #ttl

//   #calls = 0
//   #executions = 0

//   constructor (event, { min, max, tries, interval, ttl }, callback) {
//     this.#event = event
//     this.#callback = callback

//     this.#minCalls = min ?? 0
//     this.#maxCalls = tries ?? Infinity
//     this.#maxExecutions = max ?? Infinity
//     this.#interval = interval ?? 0
//     // this.#ttl = ttl ?? -1
//   }

//   get interval () {
//     return this.#interval
//   }

//   get minCalls () {
//     return this.#minCalls
//   }

//   get maxCalls () {
//     return this.#maxCalls
//   }

//   get maxExecutions () {
//     return this.#maxExecutions
//   }

//   // get ttl () {
//   //   return this.#ttl
//   // }

//   call (context, eventName, ...args) {
//     this.#calls++

//     if (this.#calls < this.#minCalls) {
//       return false
//     }

//     if (this.#calls > this.#maxCalls) {
//       return false
//     }

//     if (!!(this.#calls % this.#interval)) {
//       return true
//     }

//     return this.#execute(...arguments)
//   }

//   #execute = (context, evt, ...args) => {
//     this.#executions++

//     if (this.#executions > this.#maxExecutions) {
//       return false
//     }

//     const data = {
//       name: getNamespacedEvent(context.name, this.#event),
//       calls: this.#calls
//     }

//     if (this.#event.includes('*')) {
//       data.referredEvent = evt
//     }

//     this.#callback.call({
//       ...context,
//       event: { ...data, executions: this.#executions }
//     }, ...args)

//     return true
//   }
// }

// const EventManager = (context, cfg) => {
//   const { name } = context
//   const handlers = {}

//   const self = {
//     on: addHandler,

//     // TODO: This function doesn't work because NGN2 doesn't
//     // support removing events by name only
//     off: evt => {
//       const handler = handlers[evt] ?? null

//       if (!handler) {
//         throw new Error(`"${evt}" handler not found`)
//       } 

//       NGN.BUS.off(evt, handler)
//       delete handlers[evt]
//     },
    
//     emit: (evt, ...payload) => NGN.BUS.emit(getNamespacedEvent(name, evt), ...payload)
//   }

//   function addHandler (evt, cfg, cb) {
//     if (typeof evt !== 'string') {
//       throw new TypeError(`Event name must be of type "string". Received "${typeof evt}"`)
//     }
  
//     if (typeof cfg === 'function') {
//       return registerHandler(evt, {}, cfg)
//     }
  
//     cb ? registerHandler(...arguments) : pool(evt, cfg)
//   }
  
//   function registerHandler (evt, cfg, cb) {
//     if (typeof cfg !== 'object') {
//       throw new TypeError(`Event configuration must be an "object". Received "${typeof cfg}"`)
//     }
  
//     if (typeof cb !== 'function') {
//       throw new TypeError(`Event handler callback must be a "function". Received "${typeof cb}"`)
//     }
    
//     const handler = new EventHandler(evt, cfg, cb)
//     handlers[evt] = handler

//     NGN.BUS.on(getNamespacedEvent(name, evt), function () {
//       const valid = handler.call({ ...context, ...self }, this.event, ...arguments)

//       if (!valid) {
//         delete handlers[evt]
//       }
//     })
//   }
  
//   const pool = (namespace, cfg) => forEachKey(cfg, (evt, handler) => addHandler(getNamespacedEvent(namespace, evt), handler))

//   forEachKey(cfg, addHandler)

//   return self
// }

// export { EventManager as default }