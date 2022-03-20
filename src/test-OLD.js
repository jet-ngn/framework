import { App, Bus, html } from './index.js'

const data = {
  logs: []
}

let maxLogs = 10
let running = false

function addLog () {
  setTimeout(() => {
    data.logs.push(`Message ${Math.random()}`)

    if (data.logs.length === maxLogs) {
      data.logs.shift()
    }

    if (running) {
      addLog()
    }
  }, 800)
}

const Root = {
  name: 'root',
  selector: '#app1',

  initialize () {
    setTimeout(() => {
      running = true
      addLog()
    }, 3000)
  },

  render () {
    return html`
      <h1>Logs</h1>
      <ol>${this.track(data, 'logs', logs => logs.map(log => html`<li>${log}</li>`))}</ol>
    `
  }
}

const app = new App({
  name: 'Logger Demo',
  config: Root
})

Bus.on('ready', () => app.start())

// const data = {
//   name: 'Graham',
//   names: ['Corey', 'Mom', 'Dad', 'Allie'],
//   logs: [
//     `Message ${Math.random()}`,
//     `Message ${Math.random()}`
//   ]
// }

// let running = true
// const maxLogs = 10

// function addLog () {
//   setTimeout(() => {
//     data.logs.push(`Message ${Math.random()}`)

//     if (data.logs.length === maxLogs) {
//       data.logs.shift()
//     }

//     if (running) {
//       addLog()
//     }
//   }, 800)
// }

// const Root = {
//   name: 'root',
//   selector: '#app1',

//   data: {
//     name: {
//       type: String,
//       default: 'Graham'
//     }
//   },

//   initialize () {
//     // setTimeout(() => {
//     //   data.name = 'Allie'
//     //   data.logs.push(`Message ${Math.random()}`)
//     // }, 1500)

//     running = true

//     // addLog()

//     // setTimeout(() => {
//     //   data.name = 'Allie'

//     //   // For this use case, if I store a Data Model and add "data.names" as a field there,
//     //   // I can respond to the events fired by the model.
//     //   // data.names = ['Corey', 'Mom', 'Dad', 'Allie']
//     //   // data.names.push('Tina')
//     //   // data.names.splice(3, 1, 'Hey')
//     //   // data.names.unshift('Hey')
//     //   // data.names.shift()
//     //   // data.names.pop()
//     //   // data.names.fill('tinkerbell', 1)
//     //   // data.names.reverse()
//     //   // data.names.copyWithin(1, 2, 3)
//     // }, 1500)
//   },

//   // <!-- ${this.track(test, test => html`WORKS`)} -->
//   // , logs => logs.map(({ timestamp, entry }) => `${timestamp} ${entry}`)

//   // <p>
//   //       <ul style>
//   //         ${this.track(data, 'logs')}
//   //       </ul>
//   //     </p>
//   render () {
//     return html`
//       <h1>
//         Hi, ${this.track(data, 'name', name => {
//           return html`<span>${name}</span>`
//         })}!
//       </h1>

//       <ol>
//         ${this.track(data, 'logs', logs => logs.map(log => html`<li>${log}</li>`))}
//       </ol>
//     `
//   }
// }

// // const Root2 = {
// //   ...Root,
// //   name: 'root2',
// //   selector: '#app2',

// //   data: {
// //     name: {
// //       type: String,
// //       default: 'Allie'
// //     }
// //   },
// // }

// const MyApp = new App({
//   name: 'My App',
//   config: Root
// })

// // const MyApp2 = new App({
// //   name: 'My App 2',
// //   root: Root2
// // })

// Bus.on('ready', () => {
//   MyApp.start()
//   // MyApp2.start()
// })

// // const data = {
// //   name: 'Allie',
// //   age: '31',
// //   isAdult: true
// // }

// // const Root = {
// //   name: 'test',
// //   selector: 'body',
// //   // composes: [],

// //   // references: {
// //   //   test: '> jet-test'
// //   // },

// //   // states: [{
// //   //   idle: {
// //   //     on () {
// //   //       console.log('idle')
// //   //     },

// //   //     transitions: {
// //   //       HEY: 'hey',
// //   //       BLAH () {
// //   //         console.log(...arguments);
// //   //       }
// //   //     }
// //   //   },

// //   //   hey () {
// //   //     console.log('hey', ...arguments)
// //   //   }
// //   // }],

// //   async initialize () {
// //     setTimeout(() => {
// //       data.name = 'Graham'
// //       data.age = '36'
// //     }, 1500)
    
// //   },

// //   async render () {
// //     return html`
// //       <div>
// //         ${this.track(data, 'name')}, ${this.track(data, 'age', age => age > 33)}
// //       </div>

// //       <div>${this.track(data, 'name')}</div>
// //     `

// // // ${this.track(data, 'isAdult', isAdult => isAdult ? html`YEP` : html`NOPE`)}

// // // ${test ? html`<div>TRUE</div>` : html`<aside>FALSE</aside>`}

// //     // return html`
// //     //   <div>
// //     //     ${this.track(data, 'name')}, ${this.track(data, 'age', age => `${age}`)}
// //     //   </div>

// //     //   <div>HELLO</div>

// //     //   <div>${this.track(data, 'name')}</div>
// //     // `

// //     // const test = [{
// //     //   label: 'Graham'
// //     // }, {
// //     //   label: 'Allie'
// //     // }, {
// //     //   label: 'Corey'
// //     // }]

// //     // return html`
// //     //   <header>
// //     //     <h1>Page Title</h1>
// //     //   </header>

// //     //   <main>
// //     //     <ol>
// //     //     ${test.map(({ label }) => html`<li>${label}</li>`)}
// //     //     </ol>
// //     //   </main>

// //     //   <footer>
// //     //     Copyright &copy; 2022 GDB
// //     //   </footer>
// //     // `
// //   }
// // }

// // const TestApp = new App({
// //   name: 'Test App',
// //   version: '0.0.1',
// //   root: Root
// // })

// // Bus.on('ready', () => TestApp.start())

// // // defineCustomElement('jet-test', {
// // //   on: {
// // //     initialize () {
// // //       console.log('jet-test INIT')
// // //     }
// // //   }
// // // })