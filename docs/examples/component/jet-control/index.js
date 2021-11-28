import { Entity, html, ready } from '../../../src/index.js'
import JetControlComponent from '../../../components/jet-control.js'

const Demo = new Entity({
  selector: 'body',
  name: 'forms',

  on: {
    initialize () {
      this.emit('render')

      setTimeout(() => {
        this.emit('render', 'ERROR MESSAGE')

        // setTimeout(() => this.emit('render', 'ERROR MESSAGE 2'), 1500)
      }, 1500)
    },

    render (error) {
      this.render(html`
        <jet-control>
          <label>Field</label>
          <input type="text">
          ${!!error && html`<div class="message">${error}</div>`}
        </jet-control>

        <jet-control>
          <input type="checkbox">
          <label>Checkbox</label>
        </jet-control>

        <jet-control>
          <input type="radio">
          <label>Radio 1</label>
        </jet-control>

        <jet-control>
          <input type="radio">
          <label>Radio 2</label>
        </jet-control>

        <jet-control>
          <label>Textarea</label>
          <textarea></textarea>
        </jet-control>

        <jet-control>
          <label>Select</label>
          <select>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </jet-control>
      `)
    }
  }
})

ready(() => Demo.initialize())
