export default function FormControls (dependencies) {
  const name = 'Jet Form Controls'
  const { createId, html } = dependencies

  if (!createId || !html) {
    throw new Error(`${name} plugin requires the following Jet dependencies: "createId," "html"`)
  }

  function Field ({ beforeInputBegin, afterInputBegin, beforeInputEnd, afterInputEnd }, template) {
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
  
  function getAttributes (attributes, ...classes) {
    return {
      class: [...classes, 'control'].filter(Boolean),
      disabled: attributes.disabled ?? false,
      invalid: attributes.invalid ?? false
    }
  }
  
  function getData (prefix, { attributes = {} } = {}) {
    return {
      id: createId({ prefix }),
      attributes
    }
  }
  
  function getFieldAttributes (attributes) {
    return {
      autocomplete: attributes.autocomplete ?? 'off',
      ...attributes
    }
  }
  
  function getFieldConfig (attributes = {}, properties = {}, on = {}) {
    return {
      attributes: { ...getFieldAttributes(attributes) },
      properties,
      on
    }
  }
  
  function Label ({ id, label, beforeLabelBegin, afterLabelBegin, beforeLabelEnd, afterLabelEnd }) {
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

  return {
    name,

    install (Plugins) {
      Plugins.formControls = {
        input (cfg) {
          const { id, attributes } = getData('input', cfg)
          attributes.type = attributes.type ?? 'text'

          return html`
            <div>
              ${cfg.label && Label({ ...cfg, id })}

              ${Field(cfg, function () {
                return html`<input id="${id}">`.config(getFieldConfig(attributes, null, cfg.on))
              })}
            </div>
          `.setAttributes(getAttributes(attributes, cfg.class, attributes.type, 'input'))
        },

        select (cfg) {
          const { id, attributes } = getData('select', cfg)

          return html`
            <div>
              ${cfg.label && Label({ ...cfg, id })}
        
              ${Field(cfg, function () {
                return html`
                  <select id="${id}">
                    ${(cfg.options ?? []).map(({ label, value = '', selected }) => html`
                      <option>${label}</option>  
                    `.set({
                      attributes: { value },
                      properties: { selected: selected === true }
                    }))}
                  </select>
                `.config(getFieldConfig(attributes, null, cfg.on))
              })}
            </div>
          `.setAttributes(getAttributes(attributes, cfg.class, 'select'))
        },

        textarea (cfg) {
          const { id, attributes } = getData('textarea', cfg)

          return html`
            <div>
              ${cfg.label && Label({ ...cfg, id })}

              ${Field(cfg, function () {
                return html`<textarea id="${id}"></textarea>`.config(getFieldConfig(attributes, { value: cfg.value ?? '' }, cfg.on))
              })}
            </div>
          `.setAttributes(getAttributes(attributes, cfg.class, 'textarea'))
        },

        toggle (cfg) {
          const { id, attributes } = getData('toggle', cfg)

          return html`
            <div>
              ${Field(cfg, function () {
                return html`<input type="checkbox" id="${id}">`.config(getFieldConfig(attributes, null, cfg.on))
              })}
        
              ${cfg.label && Label({ ...cfg, id })}
            </div>
          `.setAttributes(getAttributes(attributes, cfg.class, 'toggle'))
        }
      }
    }
  }
}