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

    sto: new DataStore({
      fields: {
        hello: {
          type: String,
          default: 'hello'
        },

        wut: {
          type: Boolean,
          default: false
        }
      }
    })
  },

  on: {
    initialized () {
      this.data.sto.load([{
        hello: 'hello'
      }, {
        hello: 'hi'
      }, { wut: true }])

      console.log(this.data.toJSON());
    }
  }
})

ready(() => Demo.initialize({ data: { test: 'test' } }))
