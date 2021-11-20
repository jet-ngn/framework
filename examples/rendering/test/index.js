import { Bus, Entity, html } from '../../../src/index.js'

// const List = new Entity({
//   name: 'list',

//   on: {
//     render () {
//       this.render(html`
//         ${items.length === 0 && html`<p>No items</p>`}

//         ${items.length > 0 && html`
//           <div>ITEMS</div>

//           ${this.bind({
//             on: {
//               click: evt => console.log('CLICK')
//             }
//           }, html`<button>Click</button>`)}
//         `}
//       `)
//     }
//   }
// })

// ${this.bind({
//   on: {
//     click: evt => console.log('CLICK')
//   }
// }, html`<button>Click</button>`)}

// ${bool ? html`
//           ${this.bind({
//             on: {
//               click: evt => console.log(true)
//             }
//           }, html`<button>CLICK true</button>`)}
//         ` : html`
//           ${this.bind({
//             on: {
//               click: evt => console.log(false)
//             }
//           }, html`<button>CLICK false</button>`)}
//         `}

const Demo = new Entity({
  selector: 'body',
  name: 'test',

  on: {
    render (test = false) {
      this.render(html`
        ${test && html`
          ${this.bind({
            on: {
              click: evt => console.log('TEST')
            }
          }, html`<button>TEST</button>`)}
        `}

        ${!test && html`
          ${this.bind({
            on: {
              click: evt => console.log('NO TEST')
            }
          }, html`<button>NO TEST</button>`)}
        `}
      `)

      // this.render(html`
      //   ${test
      //     ? html`
      //       <div class="yep">YEP</div>
      //       <div class="yep2">YEP 2</div>
      //     `
      //     : html`
      //       ${this.bind({
      //         attributes: {
      //           test: Math.random(.4)
      //         },

      //         on: {
      //           click: evt => console.log('NOPE')
      //         }
      //       }, html`<div class="nope">NOPE ${Math.random(.5)}</div>`)}
      //     `
      //   }
      // `)

      // this.render(html`
      //   ${test ? html`
      //     ${this.bind({
      //       attributes: {
      //         test
      //       },

      //       on: {
      //         click: evt => console.log(1)
      //       }
      //     }, html`<div>DIV 1</div>`)}
      //   ` : html`
      //     ${this.bind({
      //       attributes: {
      //         test,
      //         hey: true
      //       },

      //       on: {
      //         click: evt => console.log(2)
      //       }
      //     }, html`<div>DIV 2</div>`)}
      //   `}
      // `)
    },

    initialize () {
      this.emit('render', true)

      setTimeout(() => {
        this.emit('render')

        setTimeout(() => {
          this.emit('render')

          setTimeout(() => {
            this.emit('render', true)

            setTimeout(() => {
              this.emit('render')
            }, 1500)
          }, 1500)
        }, 1500)
      }, 1500)
    }
  }
})

Bus.on('ready', () => Demo.initialize())
