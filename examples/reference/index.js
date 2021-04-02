import { Entity, html, ready } from '../../src/index.js'

const Entity1 = new Entity({
  name: 'entity_1',

  on: {
    initialize () {
      console.log('INIT Entity 1')
      this.replace(html`
        ${this.bind({
          on: {
            click: console.log
          }
        }, html`<button>CLICK ME</button>`)}
      `)
    }
  }
})

const Entity2 = new Entity({
  name: 'entity_2',

  on: {
    initialize () {
      console.log('INIT Entity 2')
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'refs',

  references: {
    refDiv: '.ref'
  },

  on: {
    initialize () {
      this.render(html`
        <div class="ref">REF</div>
        <div class="other">NOT REF</div>
      `)

      this.emit('render')

      setTimeout(() => {
        // this.emit('render')

        this.refs.refDiv.classList.remove('ref')

        const newEl = this.root.find('.other')
        newEl.classList.add('ref')

        console.log(this.refs.refDiv);
      }, 1500)
    },

    render (evt) {
      this.bind({ entity: Entity1 }, this.refs.refDiv)
    }
  }
})

ready(() => Demo.initialize())

// ${
//   this.bind({
//     on: {
//       click: evt => this.bind({ entity: Entity1 }, this.refs.refDiv)
//     }
//   }, html`<button>Bind to Entity 1</button>`)
// }

// ${
//   this.bind({
//     on: {
//       click: evt => this.bind({ entity: Entity2 }, this.refs.refDiv)
//     }
//   }, html`<button>Bind to Entity 2</button>`)
// }
