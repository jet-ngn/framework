import { Bus, Entity, html } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'events',

  on: {
    initialize () {
      this.emit('render')

      setTimeout(() => this.emit('render'), 1200)
    },

    render () {
      this.render(html`${this.bind({
        on: { click: console.log }
      }, html`
        <div>
          <span>test 1</span>
          <span>test 2</span>
        </div>
      `)}`)
    }
  }
})

Bus.on('ready', () => Demo.initialize())
