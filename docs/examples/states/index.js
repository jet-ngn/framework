import { Entity, Partial, html, ready } from '../../src/index.js'

const Button = Partial({
  name: 'button',

  render (number, data, getLabel) {
    return html`
      ${this.bind({
        on: {
          click: evt => this.emit('clicked', number)
        }
      }, html`
        <button>${data.bind('currentState', currentState => {
          return number === currentState ? 'Deactivate' : 'Activate'
        })} State ${number}</button>
      `)}
    `
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'states',

  data: {
    currentState: {
      type: String,
      default: 'idle'
    }
  },

  states: {
    '1' () {
      console.log('STATE 1 ACTIVE')
    },

    '2' () {
      console.log('STATE 2 ACTIVE')
    },

    '3' () {
      console.log('STATE 3 ACTIVE')
    }
  },

  on: {
    button: {
      clicked (evt, number) {
        this.data.currentState = this.data.currentState === number ? 'idle' : number
      }
    },

    data: {
      currentState: {
        changed (evt, { previous, current }) {
          this.state = current
        }
      }
    },

    initialize () {
      this.render(html`
        <header>
          ACTIVE STATE: ${this.data.bind('currentState')}
        </header>

        <div class="tools">
          ${Button.render(1, this.data)}
          ${Button.render(2, this.data)}
          ${Button.render(3, this.data)}
        </div>
      `)
    }
  }
})

ready(() => Demo.initialize())
