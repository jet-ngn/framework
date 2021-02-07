import { Entity, html, ready } from '../../../src/index.js'

const Entity1 = new Entity({
  name: 'super',

  on: {
    initialize () {
      this.render(html`
        Entity "${this.name}"

        ${this.bind({
          on: {
            click: evt => this.emit('test', this.name)
          }
        }, html`
          <button>Click to print message</button>
        `)}
      `)
    }
  }
})

const Extension = Entity1.extend({ name: 'extension' })

const Demo = new Entity({
  selector: 'body',
  name: 'extend',

  on: {
    '*': {
      test (evt, name) {
        console.log(`You clicked the button on Entity "${name}"`)
      }
    },

    initialize () {
      this.render(html`
        <h1>Extending Entities</h1>

        <p>
          Entities can be extended using the <code>extend()</code> function. Open the console to see messages.
        </p>

        ${this.bind({ entity: Entity1 }, html`<div></div>`)}
        ${this.bind({ entity: Extension }, html`<div></div>`)}
      `)
    }
  }
})

ready(() => Demo.initialize())
