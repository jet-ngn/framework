import { Partial, html } from '../../../src/index.js'

export default Partial({
  name: 'item',

  render ({ title, description }) {
    return html`
      ${this.bind({
        attributes: {
          test: true
        }
      }, html`
        <li>
          <h2>${title}</h2>
          <p>${description}</p>
        </li>
      `)}
    `
  }
})
