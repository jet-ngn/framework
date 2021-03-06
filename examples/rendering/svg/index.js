import { Entity, Partial, html, svg, ready } from '../../../src/index.js'

const Icon = Partial({
  name: 'icon',

  render () {
    return html`<div class="icon">ICON</div>`
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'svg',

  on: {
    initialize () {
      const inner = svg`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`

      console.log(Icon.toString())

      this.render(html`
        <h1>Jet SVG Rendering</h1>

        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
          ${inner}
        </svg>
      `)
    }
  }
})

ready(() => Demo.initialize())
