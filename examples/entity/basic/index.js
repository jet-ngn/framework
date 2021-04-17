import { Component, Entity, css, html, ready } from '../../../src/index.js'

const JetCounter = new Component('jet-counter', {
  attributes: {
    test: {
      type: String,
      default: 'hey',
      initial: 'wut'
    }
  },

  get style () {
    return css`
      :host {
        display: flex;
        margin: 2px;
      }

      :host .count {
        margin-right: 4px;
        padding: 2px 4px;
        background: black;
        color: grey;
        font-family: monospace;
      }

      :host(.incremented) .count {
        color: limegreen;
      }
    `
  },

  get template () {
    const { data } = this
    
    return html`
      <div class="count">${data.bind('count')}</div>

      ${this.bind({
        on: {
          click: evt => data.count++
        }
      }, html`<button class="increment">+</button>`)}

      ${this.bind({
        attributes: {
          disabled: data.bind('count', count => count === 0)
        },

        on: {
          click: evt => data.count--
        }
      }, html`<button class="decrement">-</button>`)}
    `
  },

  // TODO: Add a way to reference elements in the shadow dom too
  references: {
    incrementButton: 'button.increment'
  },

  states: {
    incremented: {
      on () {
        console.log('hello');
        this.classList.add('incremented')
      },

      off () {
        this.classList.remove('incremented')
      }
    }
  },

  data: {
    count: {
      type: Number,
      default: 0
    }
  },

  on: {
    data: {
      count: {
        changed (change) {
          this.state = change.current > 0 ? 'incremented' : 'idle'
        }
      }
    },

    initialize () {
      console.log(this.attributes);
      // setTimeout(() => {
      //   this.data.count++
      // }, 1500)
    }
  }
})

const ent = new Entity({
  name: 'ent',

  on: {
    initialized () {
      this.render(html`<div>ENT</div>`)

      console.log(this.data)
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'entity',

  data: {
    test: {
      type: String,
      default: 'test'
    }
  },

  methods: {
    test () {
      console.log('Test Method called')
      console.log('--------------------------')
    }
  },

  states: {
    test (previous, payload) {
      console.log(`"test" state activated. Payload: "${payload}"`)
      console.log(`Previous state: "${previous.state}"`)
      console.log('--------------------------')
    }
  },

  on: {
    data: {
      test: {
        changed (change) {
          console.log(`Data field "test" changed:`, change)
          console.log('--------------------------')
        }
      }
    },

    initialized () {
      this.data.test = 'hello'
      this.methods.test()
      this.setState('test', 'hi')

      this.render(html`
        <div>Hello</div>
        <jet-counter></jet-counter>

        ${this.bind({
          entity: ent,
          data: { test: 'hello' }
        }, html`
          <div>Hello</div>
        `)}
      `)
    },
  }
})

ready(() => Demo.initialize())
