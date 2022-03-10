import { App, Bus, html } from './index.js'

const data = {
  name: 'Graham',
  names: ['Graham', 'Corey', 'Mom', 'Dad']
}

const Root = {
  name: 'root',
  selector: '#app1',

  data: {
    name: {
      type: String,
      default: 'Graham'
    }
  },

  initialize () {
    setTimeout(() => {
      data.name = 'Felicia'

      // For this use case, if I store a Data Model and add "data.names" as a field there,
      // I can respond to the events fired by the model.
      // data.names = ['Corey', 'Mom', 'Dad', 'Allie']
      // data.names.push('Allie')
      // data.names.splice(1, 2, 'Hey')
      // data.names.unshift('Hey')
      // data.names.shift()
      // data.names.pop()
      // data.names.fill('tinkerbell', 1)
      // data.names.reverse()
      // data.names.copyWithin(1, 2, 3)
    }, 1500)
  },

  // <!-- ${this.track(test, test => html`WORKS`)} -->

  render () {
    return html`
      <h1>Hello, ${this.track(data, 'name')}!</h1>

      <p>
        Here are some other names:

        <ul>
          ${this.track(data, 'names')}
        </ul>
      </p>
    `
  }
}

// const Root2 = {
//   ...Root,
//   name: 'root2',
//   selector: '#app2',

//   data: {
//     name: {
//       type: String,
//       default: 'Allie'
//     }
//   },
// }

const MyApp = new App({
  name: 'My App',
  root: Root
})

// const MyApp2 = new App({
//   name: 'My App 2',
//   root: Root2
// })

Bus.on('ready', () => {
  MyApp.start()
  // MyApp2.start()
})

// const data = {
//   name: 'Allie',
//   age: '31',
//   isAdult: true
// }

// const Root = {
//   name: 'test',
//   selector: 'body',
//   // composes: [],

//   // references: {
//   //   test: '> jet-test'
//   // },

//   // states: [{
//   //   idle: {
//   //     on () {
//   //       console.log('idle')
//   //     },

//   //     transitions: {
//   //       HEY: 'hey',
//   //       BLAH () {
//   //         console.log(...arguments);
//   //       }
//   //     }
//   //   },

//   //   hey () {
//   //     console.log('hey', ...arguments)
//   //   }
//   // }],

//   async initialize () {
//     setTimeout(() => {
//       data.name = 'Graham'
//       data.age = '36'
//     }, 1500)
    
//   },

//   async render () {
//     return html`
//       <div>
//         ${this.track(data, 'name')}, ${this.track(data, 'age', age => age > 33)}
//       </div>

//       <div>${this.track(data, 'name')}</div>
//     `

// // ${this.track(data, 'isAdult', isAdult => isAdult ? html`YEP` : html`NOPE`)}

// // ${test ? html`<div>TRUE</div>` : html`<aside>FALSE</aside>`}

//     // return html`
//     //   <div>
//     //     ${this.track(data, 'name')}, ${this.track(data, 'age', age => `${age}`)}
//     //   </div>

//     //   <div>HELLO</div>

//     //   <div>${this.track(data, 'name')}</div>
//     // `

//     // const test = [{
//     //   label: 'Graham'
//     // }, {
//     //   label: 'Allie'
//     // }, {
//     //   label: 'Corey'
//     // }]

//     // return html`
//     //   <header>
//     //     <h1>Page Title</h1>
//     //   </header>

//     //   <main>
//     //     <ol>
//     //     ${test.map(({ label }) => html`<li>${label}</li>`)}
//     //     </ol>
//     //   </main>

//     //   <footer>
//     //     Copyright &copy; 2022 GDB
//     //   </footer>
//     // `
//   }
// }

// const TestApp = new App({
//   name: 'Test App',
//   version: '0.0.1',
//   root: Root
// })

// Bus.on('ready', () => TestApp.start())

// // defineCustomElement('jet-test', {
// //   on: {
// //     initialize () {
// //       console.log('jet-test INIT')
// //     }
// //   }
// // })