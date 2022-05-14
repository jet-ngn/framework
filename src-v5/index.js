import history from 'history'
import EventRegistry from './registries/EventRegistry'
import TreeNode from './TreeNode'


import { BUS as Bus, EventEmitter } from 'NGN'
import { html, svg } from './lib/tags.js'

import { Trackable } from './registries/TrackableRegistry'
import TrackingInterpolation from './TrackingInterpolation'

import { INTERNAL_ACCESS_KEY, APP } from './env'

let tree
let baseURL
let config = {}
let root
let initialized = false
let ready = false

const Components = {}

document.addEventListener('DOMContentLoaded', evt => {
  ready = true
  initialized && initialize()
})

// history.listen(({ location }) => {
//   const { pathname } = location
  
//   if (APP.currentPath === pathname) {
//     return
//   }

//   APP.ast && unmount(APP.ast)

//   APP.previousPath = APP.currentPath
//   APP.previousRoute = APP.currentRoute
//   APP.currentPath = pathname
//   APP.remainingPath = APP.currentPath

//   render()
// })

export function createApp (cfg) {
  if (initialized) {
    throw new Error(`App has already been initialized`)
  }

  config = cfg
  APP.baseURL = new URL(cfg.baseURL ?? '', location.origin)
  // APP.currentPath = location.pathname
  // APP.remainingPath = APP.currentPath
  initialized = true

  ready && initialize()
}

function initialize () {
  const nodes = document.querySelectorAll(config.selector ?? 'body')
  
  if (nodes.length > 1) {
    throw new Error(`Invalid root element selector: "${config.selector}" returned multiple nodes.`)
  }

  // TODO: Try a two-step process

  tree = new TreeNode(null, nodes[0], config, baseURL)
  nodes[0].replaceChildren(tree.render(location.pathname))

  APP.tasks.forEach(({ name, callback }) => {
    // console.log(name)
    callback()
  })

  APP.tasks = []

  console.log(tree);
}

export function install ({ components }) {
  const jet = {
    Bus,
    EventEmitter,
    html,
    navigate,
    svg,
    track,
    // getChanges,
    Trackable
  }

  ;(components ?? []).forEach(({ install }) => install(jet, Components))
}

function mount ({ view, children, config, activeRoute }) {
  Object.keys(config.on ?? {}).forEach(evt => EventRegistry.addHandler(view, evt, config.on[evt]))
  
  if (!!activeRoute) {
    view.emit(INTERNAL_ACCESS_KEY, 'route.change', {
      from: APP.previousRoute,
      to: APP.currentRoute
    })
  }

  view.emit(INTERNAL_ACCESS_KEY, 'mount')
  children.forEach(mount)
}

function unmount ({ view, children }) {
  children.forEach(unmount)
  view.emit(INTERNAL_ACCESS_KEY, 'unmount')
  EventRegistry.removeByView(view)
}

export function navigate (path) {
  history.push(path)
}

function render ({ children, view, template, routes }, path) {

  








  // const { children, routes, target, templates } = tree
  // const hasChildren = Object.keys(children).length > 0

  // console.log(tree);
  // console.log('PATH', path)

  // if (routes) {
  //   console.log('HAS ROUTES')

  //   const match = matchPath(path, routes)

  //   if (match) {
  //     return console.log('ROUTE MATCHED', match)
  //   }

  //   console.log('NO MATCH FOUND')
  // } else {
  //   console.log('DOES NOT HAVE ROUTES') // This block can be deleted
  // }

  // if (path && path !== '/') {
  //   console.log('THERE IS PATH REMAINING')

  //   if (!hasChildren) {
  //     return console.log('THERE ARE NO CHILDREN. RENDER 404')
  //   }

  //   console.log('THERE ARE CHILDREN. CHECK THEM FOR MATCHES');
  // } else {
  //   console.log('THERE IS NO PATH REMAINING. RENDER TEMPLATE')
    
  //   console.log(target.innerHTML);

  //   // if (tree.content) {
  //   //   const template = document.createElement('template')
  //   //   template.innerHTML = tree.content
  //   //   const { content } = template

  //   //   if (hasTemplates) {
  //   //     console.log('THERE ARE CHILD TEMPLATES. RENDERING...')
  //   //     Object.keys(templates).forEach(id => {
  //   //       const element = content.getElementById(id)
  //   //       console.log(element);
  //   //     })
  //   //   } else {
  //   //     console.log('THERE ARE NO CHILD TEMPLATES.');
  //   //   }

  //   //   return console.log('RENDER TREE CONTENT')
  //   // }
  // }
}

export function track (target, property, transform) {
  return new TrackingInterpolation(...arguments)
}

export {
  Bus,
  Components,
  EventEmitter,
  Trackable,
  html,
  svg
}

export { default as Session } from './Session.js'