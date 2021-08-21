import { Bus, Entity, html, Partial } from '../../src/index.js'

const Part = new Partial({
  render (url) {
    return html`
      ${this.fetch(url, html`<div>not found</div>`)}
    `
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'fetch',

  on: {
    initialize () {
      this.emit('render', 'MANUAL', './test.html')
      
      setTimeout(() => {
        this.emit('render', 'HEY', './test2.html')

        setTimeout(() => this.emit('render', 'WUT', './test.html'), 2000)
      }, 2000)
    },

    async render (text, url) {
      this.render(html`${Part.render(url)}`)
      // this.render(html`${this.fetch(url, html`<div>not found</div>`)}`)
    }
  }
})

Bus.on('ready', () => Demo.initialize())
