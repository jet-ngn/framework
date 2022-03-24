import NGN from 'NGN'
import App from './API/App.js'
import Tag from './Tag.js'
import DataModel from './data/DataModel.js'
import DataStore from './data/DataStore.js'
import Node from './Node.js'
import Constants from './Constants.js'
// import { defineCustomElement } from './API/CustomElement.js'

const { BUS, EventEmitter, Queue } = NGN

window.addEventListener('popstate', evt => {
  console.log(evt);
  // if (!evt.state) {
  //   return
  // }

  // let { hash, map, name, payload, query } = evt.state

  // if (this.has(name)) {
  //   return this.#execChange(this.getState(name), payload, { hash, map, query })
  // }

  // TODO: Throw Error
})

function getRootNode (name, target) {
  if (!selector) {
    return null
  }

  let nodelist = document.querySelectorAll(selector)

  if (nodelist.length === 0) {
    throw new Error(`"${app}" root node selector "${selector}" did not return any elements.`)
  }

  if (nodelist.length > 1) {
    console.info(nodelist)
    throw new Error(`App "${app}" root node selector refers to more than one element. Please use a more specific selector.`)
  }

  const node = nodelist[0]
  return node ? new Node(node) : null
}

function html (strings, ...interpolations) {
  return new Tag({ type: 'html', strings, interpolations })
}

function svg (strings, ...interpolations) {
  return new Tag({ type: 'svg', strings, interpolations })
}

// function css (strings, ...interpolations) {
//   return new Tag({ type: 'css', strings, interpolations })
// }

// globalThis.md = md

function track (target, property, transformFn) {
  return {
    type: Constants.Tracker,
    target,
    property,
    transformFn: transformFn ?? null
  }
}

// BUS.on('*', function () {
//   console.log(this.event);
// })

export {
  App,
  BUS as Bus,
  DataModel,
  DataStore,
  // defineCustomElement,
  EventEmitter,
  Queue,
  html,
  svg,
  // css,
  // md,
  track
}