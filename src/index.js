import Entity from './Entity.js'
import { defineCustomElement } from './CustomElement.js'

const Test = Entity({
  name: 'test',
  selector: 'body',

  on: {
    '*' () {
      console.log(this.event);
    },

    test: {
      hey () {
        console.log('HEY')
      },

      wut: {
        hey () {
          console.log('HEYYYYY');
        }
      }
    },

    initialize () {
      console.log(this.event)
    }
  }
})

Test.emit('initialize', 'test')
Test.emit('initialize')

Test.emit('test.hey')
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