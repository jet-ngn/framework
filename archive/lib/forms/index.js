import { bind, State } from '../../data/index'
import { html } from '../../parser/tags'
import { getStateByProxy } from '../../data/DataRegistry'

export function Input (cfg) {
  const { id, attributes } = processData({ prefix: 'input', cfg })

  if (!attributes.type) {
    attributes.type = 'text'
  }

  return html`
    <div>
      ${cfg.label && getLabel(id, cfg)}

      ${getControl(cfg, function () {
        return html`<input id="${id}">`.config(getControlConfig({ attributes, on: cfg.on ?? {} }))
      })}
    </div>
  `.config({
    attributes: processAttributes('input', {
      attributes,
      type: attributes.type,
      classes: cfg.classes ?? []
    })
  })
}

export function Select (cfg) {
  const { id, attributes } = processData({ prefix: 'select', cfg })
  let options = cfg.options ?? []
  const isProxy = getStateByProxy(options)

  if (!isProxy) {
    options = new State(options, {
      label: String,
      value: String,
      selected: Boolean
    })
  }

  return html`
    <div>
      ${cfg.label && getLabel(id, cfg)}

      ${getControl(cfg, function () {
        return html`
          <select id="${id}">
            ${bind(options, options => options.map(SelectOption))}
          </select>
        `.config(getControlConfig({ attributes, on: cfg.on ?? {} }))
      })}
    </div>
  `.config({
    attributes: processAttributes('select', {
      attributes,
      classes: cfg.classes ?? []
    })
  })
}

export function Textarea (cfg) {
  const { id, attributes } = processData({ prefix: 'textarea', cfg })

  return html`
    <div>
      ${cfg.label && getLabel(id, cfg)}

      ${getControl(cfg, function () {
        return html`<textarea id="${id}">`.config(getControlConfig({
          attributes,
          on: cfg.on ?? {},

          properties: {
            value: cfg.value ?? ''
          }
        }))
      })}
    </div>
  `.config({
    attributes: processAttributes('textarea', {
      attributes,
      classes: cfg.classes ?? []
    })
  })
}

export function Toggle (cfg) {
  const { id, attributes } = processData({ prefix: 'toggle', cfg })

  return html`
    <div>
      ${getControl(cfg, function () {
        return html`<input type="checkbox" id="${id}">`.config(getControlConfig({ attributes, on: cfg.on ?? {} }))
      })}

      ${cfg.label && getLabel(id, cfg)}
    </div>
  `.config({
    attributes: processAttributes('input', {
      attributes,
      type: 'toggle',
      classes: cfg.classes ?? []
    })
  })
}

function SelectOption ({ label, value = '', selected }) {
  return html`
    <option>${label}</option>
  `.set({
    attributes: { value },
    properties: { selected: selected === true }
  })
}

function getControl ({ beforeInputBegin, afterInputBegin, beforeInputEnd, afterInputEnd }, template) {
  return html`
    ${!!beforeInputBegin && beforeInputBegin}

    <div class="input_wrapper">
      ${!!afterInputBegin && afterInputBegin}
      ${template()}
      ${!!beforeInputEnd && beforeInputEnd}
    </div>

    ${!!afterInputEnd && afterInputEnd}
  `
}

function getControlConfig ({ attributes, properties, on }) {
  return {
    properties,
    on,

    attributes: {
      autocomplete: attributes.autocomplete ?? 'off',
      ...attributes
    }
  }
}

function getLabel (id, { label, beforeLabelBegin, afterLabelBegin, beforeLabelEnd, afterLabelEnd }) {
  return html`
    ${!!beforeLabelBegin && beforeLabelBegin}

    <div class="label_wrapper">
      ${!!afterLabelBegin && afterLabelBegin}
      <label for="${id}">${label}</label>
      ${!!beforeLabelEnd && beforeLabelEnd}
    </div>

    ${!!afterLabelEnd && afterLabelEnd}
  `
}

function processAttributes (controlType, { attributes, type, classes }) {
  return {
    class: [...classes, type ?? null, controlType, 'control', {
      disabled: attributes.disabled ?? false,
      invalid: attributes.invalid ?? false
    }].filter(Boolean)
  }
}

function processData ({ prefix, cfg }) {
  return {
    id: `${prefix}_${crypto.randomUUID()}`,
    attributes: cfg.attributes ?? {},
    properties: cfg.properties ?? {}
  }
}