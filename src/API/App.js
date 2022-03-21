import AppRegistry from '../registries/AppRegistry.js'
import { makeEntity } from '../Entity.js'
import Node from '../Node.js'

class ContactInfo {
  #phone
  #email
  #homepage

  constructor ({ phone, email, homepage }) {
    // TODO: Validate these
    this.#phone = phone ?? null
    this.#email = email ?? null
    this.#homepage = homepage ?? null
  }

  get email () {
    return this.#email
  }

  get homepage () {
    return this.#homepage
  }

  get phone () {
    return this.#phone
  }
}

class Contributor {
  #name
  #role
  #contact

  constructor ({ name, role, contact }) {
    this.#name = name ?? 'Anonymous Contributor'
    this.#role = role ?? null
    this.#contact = new ContactInfo(contact)
  }

  get contact () {
    return this.#contact
  }

  get name () {
    return this.#name
  }

  get role () {
    return this.#role
  }
}

function validateVersion (version) {
  // TODO: Validate semantic version
  return version
}

function getRootNode (app, selector) {
  if (!selector) {
    return null
  }

  let nodelist = document.querySelectorAll(selector)

  if (nodelist.length === 0) {
    throw new Error(`App "${app}" root node selector "${selector}" did not return any elements.`)
  }

  if (nodelist.length > 1) {
    console.info(nodelist)
    throw new Error(`App "${app}" root node selector refers to more than one element. Please use a more specific selector.`)
  }

  const node = nodelist[0]
  return node ? new Node(node) : null
}

export default class App {
  #name
  #version
  #contributors
  #entity
  #mountFn
  #started = false
  #autostart = true

  constructor (selector, config, { autostart, name, version, contributors }) {
    this.#name = name ?? 'Unnamed App'
    this.#version = validateVersion(version ?? '0.0.1-alpha.1')
    
    this.#contributors = !!contributors
      ? (Array.isArray(contributors) 
        ? contributors 
        : [contributors]).map(contributor => new Contributor(contributor)) 
      : null

    const type = typeof config

    if (type !== 'object') {
      throw new Error(`Invalid root node configuration. Expected object, received "${type}"`)
    }

    const { entity, mount } = makeEntity(getRootNode(this.#name, selector), config)

    this.#entity = entity
    this.#mountFn = mount
    this.#autostart = typeof autostart === 'boolean' ? autostart : this.#autostart

    AppRegistry.register(this)
  }

  get autostart () {
    return this.#autostart
  }

  get contributors () {
    return this.#contributors
  }

  get name () {
    return this.#name
  }

  get started () {
    return this.#started
  }

  get version () {
    return this.#version
  }

  start () {
    if (this.#started) {
      throw new Error(`App "${this.#name}" has already been started.`)
    }

    if (!this.#entity) {
      throw new Error(`No root entity has been specified. Aborting...`)
    }

    this.#started = true
    this.#mountFn()
  }
}