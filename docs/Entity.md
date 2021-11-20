# Entity

A class used to attach functionality to a single DOM Element. Entities can be attached to pre-existing DOM Elements, or they

### Usage
```js
const MyEntity = new Entity([EntityConfigObject])
```

#### Examples

TODO: Add examples
- Attach entity to pre-existing DOM Elements
- Auto-attach

<!-- Attach an Entity to a pre-existing DOM Element:

```html
<header>
  <div class="toolbar"></div>
  <menu class="user"></menu>
</header>
```

```js
import { Entity, DataStore, html } from 'jet'
import Toolbar from './Toolbar.js'

const Toolbar = new Entity({

})

const Header = new Entity({
  name: 'header',
  selector: 'header > menu.user',
  manages: [Toolbar],
  initialState: 'closed',

  data: {
    label: String,

    options: new DataStore({
      fields: {
        label: String,
        view: String
      }
    })
  },

  references: {
    closeButton: '> button.close'
  },

  states: {
    closed () {
      this.root.classList.add('hidden')
      this.refs.closeButton.removeAttribute('active')
    },

    open () {
      this.root.classList.remove('hidden')
      this.refs.closeButton.setAttribute('active')
    }
  },

  on: {
    initialize () {
      this.render(html`
        ${this.data.options.map(({ label, view }) => html`
          ${this.bind({
            on: {
              click: evt => this.emit('view.goto', view)
            }
          }, html`<li>${label}</li>`)}
        `)}
      `)
    },

    open () {
      this.states.set('open')
    },

    close () {
      this.states.set('closed')
    }
  }
})
```

In the above example, `Toolbar` will automatically be -->

Additional reading:
- [EntityConfigObject]()