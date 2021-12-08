import { Bus, Entity, html } from '../../src/index.js'

const Box1 = {
  name: 'box.1',

  on: {
    render (random) {
      console.log('Rendering Box 1...')

      random ? this.root.setAttribute('random', '') : this.root.removeAttribute('random')

      this.render(html`
        <p>This div should have the following attributes:</p>
        <ul>
          <li>class="truthy box 1"</li>
          ${random && html`<li>random</li>`}
        </ul>

        <p>It should NOT have the following attributes:</p>
        <ul>
          <li>class="falsy"</li>
          ${!random && html`<li>random</li>`}
        </ul>

        <p>The button below should re-render this div.</p>
        <div class="tools">
          ${this.bind({
            on: {
              click: evt => this.emit('render', Math.random() > .5)
            }
          }, html`<button>Re-render</button>`)}
        </div>
      `)
    }
  }
}

const Demo = new Entity({
  selector: 'body',
  name: 'all',

  on: {
    initialize () {
      console.log('Entity "initialize" event fired.')

      console.log('Rendering...')
      this.render(html`
        <div>Plain Div</div>
        
        ${this.bind({
          entity: Box1,

          attributes: {
            class: [{
              truthy: true,
              falsy: false
            }, 'box', '1']
          }
        }, html`<div></div>`)}
      `)

      this.emit('box.1.render', Math.random() > .5)
    },

    initialized () {
      console.log('Entity "initialized" event fired.')
    }
  }
})

// Bus.on('*', function () {
//   console.log(this.event)
// })

Bus.on('ready', () => Demo.initialize())
