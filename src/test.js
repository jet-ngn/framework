import { App } from './index.js'

const Root = {
  name: 'test',
  selector: 'body',
  // composes: [],

  // references: {
  //   test: '> jet-test'
  // },

  states: [{
    idle () {
      console.log('HEYYYY');
    },

    hey () {
      console.log(this)
    }
  }, {
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
    },

    test () {
      console.log('TEST')
    }
  }],

  initialize () {
    console.log(this);
    // this.states[0].set('hey')
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