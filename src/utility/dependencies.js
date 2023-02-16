// DATA_WORKER

const states = new Map

function attachBinding ({ id, state, prop }) {
  const state = states.get(state)
  state.bindings.set(prop, id)
  postMessage({ action: `binding ${id} attached` })
}

function createState ({ id, initial, model = null }) {
  states.set(id, { data: initial, model, bindings: new Map })
  postMessage({ action: `${id} created` })
}

function setProperty ({ id, property, value }) {
  const state = states.get(id)
  state.data[property] = value
  postMessage({ action: `${id} property set` })
}

onmessage = ({ data }) => {
  switch (data.action) {
    case 'create state': return createState(data)
    case 'set property': return setProperty(data)
    case 'attach binding': return attachBinding(data)
  }
}

//////////////////////////////////////////////////

// DataRegistry.js

const states = new Map
const bindings = new Map

class Binding {
  attached = false
  id = crypto.randomUUID()

  constructor (state, prop) {
    this.state = state
    this.prop = prop
    this.value = state[prop]

    DATA_WORKER.addEventListener('message', ({ data }) => {
      switch (data.action) {
        case `binding ${this.id} attached`: return (this.attached = true)
      }
    })

    DATA_WORKER.postMessage({
      action: 'attach binding',
      state: state.id,
      prop,
      id
    })
  }

  init () {
    this.placeholder = document.getElementById(this.id)
    this.current = document.createTextNode(this.value)
    this.placeholder.replaceWith(this.current)
  }

  update (value) {
    if (!value) {
      this.current.replaceWith(this.placeholder)
      return (this.current = this.placeholder)
    }

    const node = document.createTextNode(value)
    this.current.replaceWith(node)
    this.current = node
  }
}

class State {
  subscribers = new Map
  id = crypto.randomUUID()

  constructor (initial, model = null) {
    this.proxy = new Proxy(initial, {
      get: (...args) => Reflect.get(...arguments),
  
      set (target, property, value) {
        DATA_WORKER.postMessage({
          action: 'set property',
          id,
          property,
          value
        })
  
        return Reflect.set(...arguments)
      }
    })

    DATA_WORKER.addEventListener('message', ({ data }) => {
      switch (data.action) {
        case `${this.id} created`: return
        case `${this.id} property set`: return data.bindings.forEach(id => {
          this.subscribers.get(id).update(this.proxy[data.property])
        })
      }
    })

    DATA_WORKER.postMessage({
      action: 'create state',
      id: this.id,
      initial,
      model
    })
  }
}

export function StateFactory (initial, model = null) {
  const state = new State(...arguments)
  return state.proxy
}

export function bind (state, prop) {
  const binding = new Binding(...arguments),
        { id } = binding
  
  bindings.set(id, binding)
  return `<template id="${id}"></template>`
}

export async function load (state, data) {
  state.load()
}

//////////////////////////////////////////////////

const state = new State({
  name: 'Graham'
})

start({
  render () {
    return html`
      <h1>Test</h1>

      <p>${bind(state, 'name')}</p>
    `
  }
})

