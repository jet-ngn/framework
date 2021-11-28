import { Component, Entity, html, ready } from '../../../src/index.js'

const TestComponent = new Component('test-component', {
  extends: AuthorCycleElement,

  get template () {
    return html`
      <div>TEST</div>
    `
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'component.extension',

  on: {
    initialize () {
      this.render(html`
        <test-component></test-component>
      `)
    }
  }
})

ready(() => Demo.initialize())
