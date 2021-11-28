import { Entity, Component, DataModel, html, DataStore, Bus } from '../../src/index.js'

const compy = new Component('jet-test', {
  get template () {
    return html`HI`
  },

  on: {
    initialize () {
      console.log('WORKS')
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'data-example',

  data: {
    string: {
      type: String,
      default: 'default'
    },

    bool: {
      type: Boolean,
      default: true
    },

    model: new DataModel({
      fields: {
        test: {
          type: String,
          default: 'test'
        }
      }
    }),

    store: new DataStore({
      fields: {
        string: {
          type: String,
          default: 'default'
        }
      }
    })
  },

  on: {
    data: {
      change (evt, change) {
        console.log(...arguments);
      }
    },

    initialize () {
      // this.data.store.load([{
      //   string: 'wut'
      // }, {}])

      // this.data.store.append([{
      //   string: 'hey'
      // }, {
      //   string: 'bleh'
      // }])

      // console.log(this.data.store.toJSON());

      // this.render(html`
      //   <jet-test></jet-test>
      // `)

      this.render(html`
        ${this.bind({
          attributes: {
            test: this.data.model.bind('test'),
            data: {
              test: 'hello',
              // hey: this.data.bind('string'),
              huh: {
                wut: this.data.bind('string')
              }
            },
            class: [{
              maybe: this.data.bind('bool')
            }, 'test', 'hey']
          }
        }, html`<div>${this.data.bind('string')}</div>`)}
      `)

      // // this.render(html`
      // //   <div>${this.data.bind('string')}</div>
      // // `)

      setTimeout(() => {
        this.data.string = 'update'
        this.data.bool = false
      }, 1500)

      // this.render(html`
      //   ${this.bind({
      //     attributes: {
      //       test: this.data.bind('bool')
      //     }
      //   }, html`
      //     <div>${this.data.bind('string', string => !string ? 'default' : string)}</div>
      //   `)}
      // `)

      // setTimeout(() => {
      //   this.data.string = 'update'
      //   // this.data.bool = false
      //   // const record = this.data.sto.find({ test: 'heyyy' })[0]
      //   // record.test = 'blehhhh'
      // }, 1500)

      // this.data.sto.load([{
      //   test: 'heyyy'
      // }, {
      //   test: 'wuuuut'
      // }])

      // this.render(html`
      //   ${this.data.sto.records.map(record => {
      //     return html`
      //       ${this.bind({
      //         attributes: {
      //           class: [{
      //             bool: this.data.bind('bool')
      //           }, 'hey']
      //         }
      //       }, html`<div>${record.bind('test')}</div>`)}
      //     `
      //   })}
      // `)

      // setTimeout(() => {
      //   this.data.bool = false
      //   const record = this.data.sto.find({ test: 'heyyy' })[0]
      //   record.test = 'blehhhh'
      // }, 1500)
    }
  }
})

Bus.on('ready', () => Demo.initialize({ data: { test: 'test' } }))
