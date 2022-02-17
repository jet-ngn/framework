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
    idle: {
      on () {
        console.log('idle')
      },

      transitions: {
        HEY: 'hey',
        BLAH () {
          console.log(...arguments);
        }
      }
    },

    hey () {
      console.log('hey', ...arguments)
    }
  }],

  async initialize () {
    await this.states[0].set('idle')

    this.states[0].transition('BLAH', 'HELLOOOO')

    // await this.states[1].set('idle')
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