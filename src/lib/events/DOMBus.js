import DOMEventListener from './DOMEventListener'

export let listeners = new Map
export let events = new Set
const handlers = {}

export function addDOMEventHandler (view, node, name, callback, options) {
  const shouldApplyListeners = ![...listeners.keys()].some(({ event }) => event === name) && !events.has(name)
  const listener = new DOMEventListener(...arguments)

  listeners.set({
    view,
    event: name,
    id: listener.id,
    node,
    handler: listener.handler.id
  }, listener)

  if (['blur', 'focus'].includes(name)) {
    return node.addEventListener(name, evt => listener.handler.call(name))
  }
  
  if (shouldApplyListeners) {
    applyListeners(name)
  }

  return listener
}

function applyListeners (eventName) {
  events.add(eventName)

  const handler = async (evt) => {
    const { target } = evt
    const matches = [...listeners.values()].filter(({ node, event }) => event === eventName && (target === node || node.contains(target))).reverse()
    let cancel = false
    let targetIsChild = false

    for (let { node, handler, view } of matches) {
      if (cancel && targetIsChild) {
        continue
      }

      const propagate = await handler.call(view, evt)
      
      if (propagate) {
        targetIsChild = false
      } else {
        targetIsChild = node.contains(target)
        cancel = true
      }
    }
  }

  handlers[eventName] = handler
  return document.body.addEventListener(eventName, handler)
}

export function removeDOMEventsByNode (target) {
  const remainingEvents = new Set

  ;[...listeners.keys()].filter(({ event, node }) => {
    const match = node === target || node.contains(target)

    if (!match) {
      remainingEvents.add(event)
    }

    return match
  }).forEach(key => listeners.delete(key))

  events = remainingEvents
}

export function logDOMEvents () {
  console.log(listeners)
}

// export function removeDOMEvents () {
//   listeners = new Map
//   events.forEach(event => document.body.removeEventListener(event, handlers[event]))
//   events = new Set
// }

export function removeDOMEventsByView (target) {
  const remainingEvents = new Set

  ;[...listeners.keys()].filter(({ event, node, view }) => {
    const match = view === target

    if (!match || node === view.element) {
      remainingEvents.add(event)
    }

    return match
  }).forEach(key => listeners.delete(key))

  events = remainingEvents
}