import { Component, html, css, Utilities } from '../src/index.js'

const JetControlComponent = Component('jet-control', {
  get template () {
    return html`<slot></slot>`
  },

  get style () {
    return css`
      :host {
        display: block;
        contain: style;
        max-width: 100%;
      }

      :host *,
      :host *:before,
      :host *:after {
        box-sizing: border-box;
      }
    `
  },

  // attributes: {
  //   type: {
  //     type: String,
  //     valid: ['field', 'datalist', 'toggle', 'textarea', 'select']
  //   }
  // },

  // reconciler: {
  //   get exempt () {
  //     return [...labels, source]
  //   }
  // },

  on: {
    initialize () {
      this.labels = []
      this.source = null
      this.type = null

      ;[...this.children].forEach(child => catalogChild(this, child))

      if (!this.source) {
        throw new ReferenceError('<jet-control> requires an <input> element as a child')
      }

      this.initialValue = this.source.value
    }
  }
})

function catalogChild (context, child) {
  switch (child.nodeName) {
    case 'LABEL':
      child.addEventListener('click', evt => context.source.focus())
      context.labels.push(child)
      return

    case 'INPUT':
    case 'TEXTAREA':
    case 'SELECT':
    case 'DATALIST':
      context.source = child
      return initializeInput(context, child)

    default: if (child.children.length > 0) {
      ;[...child.children].forEach(catalogChild)
    }
  }
}

function initializeInput (context, child) {
  const nodeName = child.nodeName.toLowerCase()

  context.type = ['input', 'textarea'].includes(nodeName)
    ? ['checkbox', 'radio'].includes(child.type)
      ? 'toggle'
      : 'field'
    : nodeName

  switch (type) {
    case 'field': return initializeField(context, child)
    case 'toggle': return initializeToggle(context, child)
    case 'select': return initializeSelect(context, child)
    case 'datalist': return initializeDatalist(context, child)
    default: throw new Error(`Invalid input type "${type}"`)
  }
}

function initializeField (context, input) {
  // console.log('INIT FIELD')
  // console.log(input)
}

function initializeToggle (context, input) {
  // console.log('INIT TOGGLE')
  // console.log(input)
}

function initializeSelect (context, input) {
  // console.log('INIT SELECT')
  // console.log(input)
}

function initializeDatalist (context, input) {
  // console.log('INIT DATALIST')
  // console.log(input)
}

export { JetControlComponent as default }