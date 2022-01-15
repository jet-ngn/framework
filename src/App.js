import Entity from './Entity.js'

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

export default class App {
  #name
  #version
  #contributors
  #root
  #started = false

  constructor ({ name, version, contributors, root }) {
    this.#name = name ?? 'Unnamed App'
    this.#version = validateVersion(version ?? '0.0.1-alpha.1')
    
    this.#contributors = !!contributors
      ? (Array.isArray(contributors) 
        ? contributors 
        : [contributors]).map(contributor => new Contributor(contributor)) 
      : null

    const type = typeof root

    if (type !== 'object') {
      throw new Error(`Invalid root. Expected Entity or Entity config object, received "${type}"`)
    }

    this.#root = root instanceof Entity ? root : new Entity(root)
  }

  get contributors () {
    return this.#contributors
  }

  get name () {
    return this.#name
  }

  get version () {
    return this.#version
  }

  start () {
    if (this.#started) {
      throw new Error(`App "${this.#name}" has already been started.`)
    }

    if (!this.#root) {
      throw new Error(`No "root" Entity has been specified. Aborting...`)
    }

    this.#started = true
    this.#root.initialize()
  }
}