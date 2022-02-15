import NGN from 'NGN'
import App from './App.js'
import { html } from './Tags.js'
import DataModel from './DataModel.js'
// import { defineCustomElement } from './CustomElement.js'

const Root = {
  name: 'test',
  selector: 'body',
  // composes: [],

  data: {
    test: {
      type: String,
      default: 'hello'
    },
    
    model: new DataModel({
      test: {
        type: String,
        default: 'hello',
      },
    
      test2: String
    })
  },

  // references: {
  //   test: '> jet-test'
  // },

  on: {
    data: {
      change ({ revert, from, to }) {
        console.log('change', { from, to })
        console.log(this.data.model.toJSON)
        revert()
        console.log('revert', { from: to, to: from })
        console.log(this.data.model.toJSON)
      },

      // model: {
      //   change () {
      //     console.log(this.event, ...arguments)
      //   },

      //   test: {
      //     change () {
      //       console.log(this.event, ...arguments)
      //     }
      //   }
      // }
    }
  },

  initialize () {
    console.log(this.data.model.toJSON)
    this.data.model.test = 'hiii'
    // console.log(this.data.model.toJSON)
    // this.data.test = 'hiii'
    // console.log(this.data.test);
    // const tag = this.render('hey')
    // console.log(tag);
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