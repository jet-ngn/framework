class Typeahead {
  #queue = new Set
  #results = new State([])

  get results () {
    return this.#results
  }

  update (input) {
    // Use Observer Pattern
    // Cancel current request
    // Start new request with input
    // on request complete, fire notify()
  }
}


// Usage:

const MyView = {
  render () {
    const typeahead = new Typeahead()

    return html`
      <div class="input control">
        <div class="input_wrapper">
          ${html`<input />`.on({
            input: ({ target }) => typeahead.update(target.value)
          })}
        </div>
      </div>

      <ul class="results">
        ${map(typeahead.results, ({ name }) => html`<li>${name}</li>`)}
      </ul>
    `
  }
}