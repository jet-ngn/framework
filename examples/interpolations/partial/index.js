import { Entity, Bus, Partial, DataStore, html, ready } from '../../../src/index.js'

Bus.on('*', function () {
  console.log(this.event)
})

const Test = Partial({
  name: 'partial',

  render (number) {
    return html`
      <h2>Partial ${number}</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

      ${this.bind({
        on: {
          click: evt => {
            this.emit('button.clicked', number)
          }
        }
      }, html`
        <div class="partial">
          PARTIAL 1
          ${Test2.render()}
        </div>
      `)}

      <hr />
    `
  }
})

const Test2 = Partial({
  name: 'partial2',

  render () {
    return html`
      ${this.bind({
        on: {
          click: console.log
        }
      }, html`
        <button>CLICK ME</button>
      `)}
    `
  }
})

const App = new Entity({
  selector: 'body',
  name: 'app',

  references: {
    partials: '.partials'
  },

  on: {
    initialize () {
      this.render(html`
        <h1>Partials</h1>

        <p>
          Partials are lightweight, reusable snippets of html which can be hydrated with data. They can fire events which can be received and handled by the parent Entity or Entities further up the hierarchy.
        </p>

        <p>
          Open the console to see the button click events being handled by the parent Entity.
        </p>

        <div class="partials">
          ${Test.render('1')}
          ${Test.render('2')}
          ${Test.render('3')}
        </div>
      `)
    },

    partial: {
      button: {
        clicked (evt, number) {
          console.log(`You clicked Partial ${number}'s button.`)
        }
      }
    }
  }
})

ready(() => App.initialize())
