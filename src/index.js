import NGN from 'NGN'
// import App from './App.js'
// import { defineCustomElement } from './CustomElement.js'

import { makeEntity } from './Entity.js'

const Test = makeEntity({
  name: 'test',
  selector: 'body',

  references: {
    test: 'jet-test'
  },

  on: {
    '*' () {
      console.log(this.event)
    },

    test: {
      hey () {
        console.log('hey')
      }
    },

    initialize () {
      console.log(this.event)
      console.log('INIT')
    }
  }
})

// console.log(Test)

// Test.on('test', () => console.log('TEST'))

// Test.emit('test')

// const OID = Test.on('hey', { max: 2 }, () => console.log('hey'))

// Test.emit('hey')
// console.log(NGN.BUS.listeners())
// Test.emit('hey')
// console.log(NGN.BUS.listeners())
// Test.emit('hey')
// console.log(NGN.BUS.listeners())

Test.emit('initialize')
Test.emit('initialize')

// const Root = {
//   name: 'test',
//   selector: 'body',

//   references: {
//     comp: 'jet-test'
//   },

//   on: {
//     initialize () {
//       console.log(this)
//     }
//   }
// }

// const TestApp = new App({
//   name: 'Test App',
//   version: '0.0.1',
//   root: Root
// })

// TestApp.start()

// console.log(Root);

// console.log(Test.cfg);

// Test.on('test', { tries: 2 }, number => console.log('FIRED ', number))

// Test.on('test', console.log)
// Test.off('test')

// Test.emit('test', 1)
// Test.emit('test', 2)
// Test.emit('test', 3)
// Test.emit('test', 4)
// Test.emit('test', 5)
// Test.emit('test', 6)
// Test.emit('test', 7)
// Test.emit('test', 8)
// Test.emit('test', 9)
// Test.emit('test', 10)
// Test.emit('test', 11)

// Test.emit('initialize', 'test')
// Test.emit('initialize')

// Test.emit('test.hey')
// Test.emit('test.wut.hey')

// Test.off('test.hey')

// Test.emit('test.hey')

// defineCustomElement('jet-test', {
//   on: {
//     initialize () {
//       console.log('jet-test INIT')
//     }
//   }
// })

// const JetTestElement = CustomElement({
//   name: 'jet-test'
// })

// customElements.define('jet-test', JetTestElement)

// import HTMLEntityConstructor from './Entity.js'
// import JetCustomElement from './JetCustomElement.js'

// const Test = new (HTMLEntityConstructor())({
//   name: 'test',
//   selector: 'body',

//   references: {
//     test: '> .test',
//     hey: '.hey'
//   },

//   on: {
//     initialize () {
//       console.log('HEY')
//     }
//   }
// })

// // Test.initialize()

// console.log(Test);

// // const TestElement = new JetCustomElement(`{
// //   name: 'jet-test'
// // }`)

// // customElements.define('jet-test', TestElement)

// // const hello = new Entity({
// //   // name: 'hello',
// //   // selector: '.hello',

// //   states: {
// //     test () {
// //       console.log('YO');
// //     }
// //   }
// // })

// // const test = new Entity({
// //   // name: 'test',

// //   composes: [hello],

// //   states: {
// //     test () {
// //       console.log('wut');
// //     }
// //   }

// //   // extends: [
// //   //   hello,

// //   //   {
// //   //     name: 'hey',
// //   //     extends: [hello]
// //   //   }
// //   // ]
// // })

// // console.log(test);