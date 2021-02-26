import { Entity, DataModel, html, ready, DataStore } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'data',

  data: {
    hey: {
      type: String,
      default: 'hey'
    },

    mod: new DataModel({
      fields: {
        hi: {
          type: String,
          default: 'hi'
        }
      }
    }),

    // sto: new DataStore({
    //   fields: {
    //     hello: {
    //       type: String,
    //       default: 'hello'
    //     },

    //     wut: {
    //       type: Boolean,
    //       default: false
    //     }
    //   }
    // })
  },

  on: {
    initialize () {
      // this.data.sto.load([{
      //   hello: 'hello'
      // }, {
      //   hello: 'hi'
      // }, { wut: true }])
      // console.log(this.data.mod.bind('hi'));
      // <div>${this.data.mod.bind('hi')}</div>
      this.render(html`
        ${this.bind({
          attributes: {
            class: this.data.bind('hey'),
            id: this.data.mod.bind('hi')
          }
        }, html`<div>${this.data.bind('hey')}</div>`)}
      `)

      // console.log(this.data.hey)

      setTimeout(() => {
        this.data.hey = 'wuuuuut'

        setTimeout(() => {
          this.data.mod.hi = 'helloooooo'
        }, 1500)
      }, 1500)
    }
  }
})

ready(() => Demo.initialize({ data: { test: 'test' } }))
