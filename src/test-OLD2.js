import { App, Bus, html } from './index.js'

// const data = {
//   name: 'Graham',
//   age: '37' // Numbers don't work yet
// }

// function InputControl (namespace, label, attributes) {
//   const { id, type, value } = attributes
  
//   return html`
//     <div class="${type} input control">
//       <div class="label wrapper">
//         <label for="${id}">${label}</label>
//       </div>

//       <div class="input wrapper">
//         ${this.bind({
//           attributes: { id, type, value }
//         }, html`<input>`)}
//       </div>
//     </div>
//   `
// }

// ${InputControl.bind(this, 'input.name', 'Name', {
//   type: 'text',
//   id: 'name_input',
//   value: this.track(data, 'name')
// })}

// const Fields = {
//   name: 'fields',

//   render () {
//     return html`
//       <label>Field</label>
//       <input type="text">
//     `
//   }
// }

const Form = {
  name: 'form',

  data: {
    name: {
      type: String,
      default: 'Graham'
    }
  },

  initialize () {
    this.data.name = 'Corey'
  },

  render () {
    return html`
      <legend>Logs</legend>

      <div class="hello"></div>
      
      ${this.bind({ config: Fields }, html`<fieldset></fieldset>`)}
    `
  }
}

const app = new App({
  name: 'Form Demo',
  root: 'form',
  config: Form
})

Bus.on('ready', () => app.start())