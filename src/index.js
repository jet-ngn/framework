import NGN from 'NGN'
import App from './App.js'
// import { defineCustomElement } from './CustomElement.js'

import { makeEntity } from './Entity.js'

const Root = {
  name: 'test',
  selector: 'body',
  // composes: [],

  references: {
    test: '> jet-test'
  },

  on: {
    initialize () {
      console.log(this)
    }
  }
}

const TestApp = new App({
  name: 'Test App',
  version: '0.0.1',
  root: Root
})

TestApp.start()

// defineCustomElement('jet-test', {
//   on: {
//     initialize () {
//       console.log('jet-test INIT')
//     }
//   }
// })