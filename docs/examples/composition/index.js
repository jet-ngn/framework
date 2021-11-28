import { Bus, Entity, html } from '../../src/index.js'

const EntityConfig = {
  name: 'sub',

  // references: {
  //   hi: '.hello'
  // },

  // data: {
  //   test: String
  // },

  // states: {
  //   loading: {
  //     on () {
  //       console.log('LOADING FROM 1')
  //     },

  //     off () {
  //       console.log('1 OFF')
  //     }
  //   },

  //   test () {
  //     console.log('TEST')
  //   }
  // },

  on: {
    initialize () {
      console.log('INIT 1')
    },

    // test: {
    //   hey () {
    //     console.log('test.hey 1')
    //   }
    // }
  }
}

const Demo = new Entity({
  selector: 'body',
  name: 'cloning',

  on: {
    initialize () {
      this.render(html`
        ${this.bind({
          entity: new Entity(EntityConfig, {
            // initialState: 'loading',

            // references: {
            //   hey: '.wut'
            // },

            // methods: {
            //   test () {
            //     console.log('TEST')
            //   }
            // },

            // states: {
            //   loading (previous, payload, parent) {
            //     console.log('LOADING FROM 2')
            //     parent()
            //   }
            // },

            // data: {
            //   hello: String
            // },

            on: {
              initialize (parent) {
                console.log('INIT 2')
                parent()

                // this.emit('test.hey')
              },

              // test: {
              //   hey (parent) {
              //     console.log('test.hey 2')
              //     parent()
              //   },

              //   wut () {
              //     console.log('test.wut')
              //   }
              // }
            }
          }, {
            on: {
              initialize (parent) {
                console.log('INIT 3')
                parent()
              }
            }
          })
        }, html`<div>Hello</div>`)}
      `)
    }
  }
})

Bus.on('ready', () => Demo.initialize())
