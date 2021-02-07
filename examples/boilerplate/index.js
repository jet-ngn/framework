import { Entity, html, ready } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: '__NAME__',

  init () {

  }
})

ready(() => Demo.initialize())
