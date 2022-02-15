import NGN from 'NGN'
import App from './App.js'
import { html } from './Tags.js'
import DataModel from './DataModel.js'
import DataStore from './DataStore.js'
// import { defineCustomElement } from './CustomElement.js'

const Root = {
  name: 'test',
  selector: 'body',
  // composes: [],

  // references: {
  //   test: '> jet-test'
  // },

  states: [{
    idle: {
      on () {
        console.log('IDLE')
      },

      transitions: {
        test: 'TEST',
        test2: () => {
          console.log('DO STUFF')
        }
      }
    }
  }, {
    test () {
      console.log('TEST')
    }
  }],

  initialize () {
    console.log(this);
  },

  render (str) {
    return html`
      <div>TEST</div>
    `
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