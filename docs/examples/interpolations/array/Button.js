import { Entity, html } from '../../../src/index.js'

export default new Entity({
  name: 'button',

  data: {
    itemCount: {
      type: Number,
      default: 10
    }
  },

  on: {
    data: {
      itemCount: {
        changed (evt, count) {
          this.emit('render')
        }
      }
    },

    initialize () {
      this.emit('render')

      this.root.on('click', evt => {
        this.emit('render-items', Array.from({
          length: this.data.itemCount
        }, (value, index) => ({
          title: `Item ${Math.random()}`,
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        })))

        this.data.itemCount = Math.floor(Math.random() * 10)
      })
    },

    render () {
      this.render(html`Render ${this.data.itemCount} items`)
    }
  }
})
