import { App, Bus, Diagnostics, html } from '../../src/index.js'

// const Box1 = {
//   name: 'box.1',

//   on: {
//     render (random) {
//       console.log('Rendering Box 1...')

//       random ? this.root.setAttribute('random', '') : this.root.removeAttribute('random')

//       this.render(html`
//         <p>This div should have the following attributes:</p>
//         <ul>
//           <li>class="truthy box 1"</li>
//           ${random && html`<li>random</li>`}
//         </ul>

//         <p>It should NOT have the following attributes:</p>
//         <ul>
//           <li>class="falsy"</li>
//           ${!random && html`<li>random</li>`}
//         </ul>

//         <p>The button below should re-render this div.</p>
//         <div class="tools">
//           ${this.bind({
//             on: {
//               click: evt => this.emit('render', Math.random() > .5)
//             }
//           }, html`<button>Re-render</button>`)}
//         </div>
//       `)
//     }
//   }
// }

// const Demo = {
//   selector: 'body',
//   name: 'all',

//   data: {
//     test1: String,
//     test2: String,
//     test3: String
//   },

//   on: {
//     test (str) {
//       console.log(str)
//     },

//     initialize () {
//       // console.log('Entity "initialize" event fired.')

//       // console.log('Rendering...')
//       this.render(html`
//         <div>Plain Div</div>

//         <div>${this.data.bind('test1', test1 => test1)}</div>
        
//         ${this.bind({
//           entity: Box1,

//           attributes: {
//             disabled: this.data.bind((fields) => [...Object.values(fields)].every(string => !!string)),

//             class: [{
//               truthy: true,
//               falsy: false
//             }, 'box', '1']
//           }
//         }, html`<div></div>`)}
//       `)

//       setTimeout(() => {
//         this.data.test1 = 'hey'
//         this.data.test2 = 'wut'
//         this.data.test3 = 'yo'
//       }, 1500)

//       // this.emit('box.1.render', Math.random() > .5)
//     },

//     // initialized () {
//     //   console.log('Entity "initialized" event fired.')

//     //   Bus.emit('all.test', 'WORKS')
//     // }
//   }
// }

const Demo = {
  name: 'demo',
  selector: 'body',

  references: {
    items: ':scope > div'
  },

  on: {
    initialize () {
      ['Graham', 'Corey', 'Allie'].forEach(name => this.emit('add', name))

      setTimeout(() => {
        for (let i = 0; i < this.refs.items.length; i++) {
          this.refs.items[i].destroy()
        }
        
        this.emit('add', 'Tina')
        this.emit('add', 'Jaimie')

        this.emit('add', 'Jose')

        setTimeout(() => {
          for (let i = 0; i < this.refs.items.length; i++) {
            this.refs.items[i].destroy()
          }
          
          this.emit('add', 'Jake')
          this.emit('add', 'Tigerlily')
  
          this.emit('add', 'Tinkerbell')
        }, 1500)
      }, 1500)
    },

    add (name) {
      this.append(html`<div>${name}</div>`)
    }
  }
}

const Test = new App({
  name: 'Test App',
  version: '1.0.0',
  root: Demo,
  
  contributors: [{
    name: 'Graham Butler',
    role: 'Lead Developer',
    contact: {
      homepage: 'https://github.com/gbdrummer'
    }
  }]
})

Test.start()
// Diagnostics.logEvents()
