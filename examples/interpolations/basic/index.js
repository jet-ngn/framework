import { Entity, html, ready } from '../../../src/index.js'

const Filter = new Entity({
  name: 'filter',

  on: {
    initialize () {
      this.emit('render')
    },

    render (bool = true) {
      this.render(html`
        <div>
          <aside>ASIDE</aside>

          ${bool && html`
            <div>BOOL IS TRUE</div>
          `}
        </div>
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

      setTimeout(() => this.emit('filter.render', false), 1500)
    }
  }
})

ready(() => Demo.initialize())
