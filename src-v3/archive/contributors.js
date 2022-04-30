this.#contributors = !!contributors
      ? (Array.isArray(contributors) 
        ? contributors 
        : [contributors]).map(contributor => new Contributor(contributor)) 
      : null

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