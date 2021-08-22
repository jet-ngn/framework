import { Bus, Entity, html } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: '__NAME__',

  on: {
    initialize () {

    },

    initialized () {

    }
  }
})

Bus.on('ready', () => Demo.initialize())
