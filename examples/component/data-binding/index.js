import { Bus, Entity, Component, DataModel, html, DataStore } from '../../../src/index.js'

const Compy = new Component('jet-compy', {
  data: {
    test: {
      type: String,
      default: 'test'
    },

    model: new DataModel({
      fields: {
        hey: {
          type: String,
          default: 'hey'
        },

        wut: {
          type: String,
          default: 'wut'
        }
      }
    }),

    store: new DataStore({
      fields: {
        name: String
      }
    })
  },

  get template () {
    console.log(this.data);

    return html`COMPY`
  },

  on: {
    initialize () {
      // console.log('Initializing Component.')
      // console.log('DATA: ', this.data)
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'data-binding',

  on: {
    initialize () {
      this.render(html`
        ${this.bind({
          data: {
            test: 'heyyyy',

            model: {
              hey: 'wut'
            },

            store: [{
              name: '1'
            }, {
              name: '2'
            }, {
              name: '3'
            }]
          }
        }, html`<jet-compy></jet-compy>`)}
      `)
    }
  }
})

Bus.on('ready', () => Demo.initialize())
