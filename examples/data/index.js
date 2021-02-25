import { Entity, html, ready } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'data',

  data: {
    hey: {
      type: String,
      default: 'hey'
    }
  },

  on: {
    initialize () {
      console.log(this.data);
    }
  }
})

ready(() => Demo.initialize({ data: { test: 'test' } }))
