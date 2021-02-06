class StyleRegistry {
  #style = document.createElement('style')
  #rules = []

  constructor () {
    this.#style.innerHTML = '/* Jet Styles */'
    document.head.appendChild(this.#style)
  }

  get stylesheet () {
    return this.#style.sheet
  }

  createRule (id, decls) {
    const selector = this.#generateSelector(id)

    let index = this.#style.sheet.insertRule(`${selector} {
      ${decls}
    }`)

    this.#rules.splice(index, 0, id)
  }

  getRule (id) {
    return this.#style.sheet.rules.item(this.#getRuleIndex(id))
  }

  hasRule (id) {
    return !!this.getRule(id)
  }

  removeRule (id) {
    this.#style.sheet.deleteRule(this.#getRuleIndex(id))
  }

  updateRule (id, decls) {
    const rule = this.getRule(id)

    if (!rule) {
      return this.createRule(...arguments)
    }

    const div = document.createElement('div')
    div.style = decls


    ;[...rule.style].forEach(decl => {
      const existing = rule.style[decl]

      if (existing !== div.style[decl]) {
        rule.style[decl] = div.style[decl]
      }
    })
  }

  #generateSelector = id => `.${id}`

  #getRuleIndex = id => this.#rules.indexOf(id)
}

export default new StyleRegistry()
