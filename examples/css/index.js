import { Entity, html, ready } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'css-in-js',

  on: {
    initialize () {
      this.render(html`
        ${this.bind({
          css: `
            background: green;
            color: white;
          `
        }, html`<div>EXAMPLE DIV</div>`)}
      `)

      setTimeout(() => {
        this.render(html`
          ${this.bind({
            css: `
              background: red;
              color: white;
            `
          }, html`<div>THIS DIV IS RED</div>`)}
        `)
      }, 1500)
    }
  }
})

ready(() => Demo.initialize())
