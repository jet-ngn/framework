import { Component, html, css } from '../../../src/index.js'

const JetCounter = new Component('jet-counter', {
  attributes: {
    test: {
      type: Boolean
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

  references: {
    incrementButton: 'button.increment'
  },

  states: {
    incremented: {
      on () {
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
      // console.log(this.refs);
      // setTimeout(() => {
      //   this.data.count++
      // }, 1500)
    }
  }
})

export { JetCounter as default }
