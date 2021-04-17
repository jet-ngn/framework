import { Entity, html, ready } from '../../../src/index.js'

const Filter = new Entity({
  name: 'filter',

  on: {
    initialize () {
      this.emit('render')
    },

    render (bool = false) {
      this.render(html`
        ${this.bind({
          on: {
            click: console.log
          }
        }, html`
          <div>
            <h1>NESTED BINDING</h1>

            ${this.bind({
              on: {
                click: console.log
              }
            }, html`<button>CLICK</button>`)}
          </div>
        `)}
      `)
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'interpolations',

  on: {
    initialize () {
      this.render(html`
        ${this.bind({
          entity: Filter
        }, html`<div class="filter"></div>`)}
      `)

      setTimeout(() => {
        this.emit('filter.render', true)

        // setTimeout(() => this.emit('filter.render', true), 1500)
      }, 1500)
    }
  }
})

ready(() => Demo.initialize())
