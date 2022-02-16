import { App, Bus } from './index.js'

const Root = {
  name: 'test',
  selector: 'body',
  // composes: [],

  // routes: {
  //   name: '',
  //   path: '/test',
  //   state: this.states[0].idle
  // },

  // references: {
  //   test: '> jet-test'
  // },

  states: [{
    idle () {
      console.log('HEYYYY');
    },

    hey () {
      console.log(...arguments)
    }
  }, {
    idle: {
      route: {

      },

      on () {
        console.log('IDLE', ...arguments)
      },

      transitions: {
        TEST: 'test',
        IDLE: () => {
          console.log('DO STUFF')
        }
      }
    },

    test () {
      console.log('TEST')
    }
  }],

  initialize () {
    this.states[0].set('hey')
    this.states[1].set('idle')
  },

  // render (str) {
  //   return html`
  //     <div>TEST</div>
  //   `
  // }
}

const TestApp = new App({
  name: 'Test App',
  version: '0.0.1',
  root: Root
})

Bus.on('ready', () => TestApp.start())

// defineCustomElement('jet-test', {
//   on: {
//     initialize () {
//       console.log('jet-test INIT')
//     }
//   }
// })