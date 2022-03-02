import { App, Bus, html } from './index.js'

const Root = {
  name: 'root',
  selector: 'body',

  data: {
    name: {
      type: String,
      default: 'Graham'
    }
  },

  initialize () {
    setTimeout(() => this.data.name = 'Felicia', 3000)
  },

  render () {
    return html`
      <h1>Hello, ${this.track(this.data, 'name')}!</h1>
    `
  }
}

const MyApp = new App({
  name: 'My App',
  root: Root
})

Bus.on('ready', () => MyApp.start())

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