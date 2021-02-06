import { Entity, html, ready } from '../../../src/index.js'

const HelloWorld = new Entity({
  selector: 'body',

  on: {
    initialize () {
      this.render(html`<h1>Hello World!</h1>`)
    }
  }
})

ready(() => HelloWorld.initialize())
