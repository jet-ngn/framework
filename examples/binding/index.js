import { Bus, Entity, html, Partial } from '../../src/index.js'

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

const Input = new Partial({
  name: 'input',

  render (value) {
    return html`${this.bind({
      properties: { value }
    }, html`<input type="text">`)}`
  }
})

const Textarea = new Partial({
  name: 'textarea',

  render (value) {
    return html`
      ${this.bind({
        attributes: {
          class: Math.random(.5)
        }
      }, html`<textarea>${value}</textarea>`)}
    `
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
      this.emit('render', 'START')

      setTimeout(() => this.emit('render', 'UPDATE'), 2000)
    },

    render (value) {
      this.render(html`
        <hr />

        ${Input.render(value)}

        ${Textarea.render(value)}
      `)

      // ${this.bind({
      //   on: {
      //     click: evt => this.emit('bind.ref1')
      //   }
      // }, html`<button>Bind Ref 1</button>`)}

      // ${this.bind({
      //   on: {
      //     click: evt => this.emit('bind.ref2')
      //   }
      // }, html`<button>Bind Ref 2</button>`)}

      // ${this.bind({
      //   on: {
      //     click: evt => this.emit('bind.input')
      //   }
      // }, html`<button>Bind Input</button>`)}
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

Bus.on('ready', () => Demo.initialize())
