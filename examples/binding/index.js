import { Entity, html, ready } from '../../src/index.js'

const Ref1 = new Entity({
  name: 'ref1',

  on: {
    initialize () {
      console.log('INIT 1')
      this.render(html`REF1`)
    }
  }
})

const Ref2 = new Entity({
  name: 'ref2',

  on: {
    initialize () {
      console.log('INIT 2')
      this.render(html`REF2`)
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'binding',

  references: {
    ref: '.ref1'
  },

  on: {
    initialize () {
      this.render(html`
        <hr />

        ${this.bind({
          on: {
            click: evt => this.emit('bind.ref1')
          }
        }, html`<button>Bind Ref 1</button>`)}

        ${this.bind({
          on: {
            click: evt => this.emit('bind.ref2')
          }
        }, html`<button>Bind Ref 2</button>`)}
      `)
    },

    bind: {
      ref1 () {
        this.bind({
          entity: Ref1
        }, this.refs.ref)
      },

      ref2 () {
        this.bind({
          entity: Ref2
        }, this.refs.ref)
      }
    },
  }
})

ready(() => Demo.initialize())
