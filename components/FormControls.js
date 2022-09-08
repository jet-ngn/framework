export const inputControl = {
  name: 'Jet Input Control',
  
  install ({ createID, html }, Components) {
    Components.inputControl = cfg => {
      const {
        label,
        value,
        on,
        beforeLabelBegin,
        afterLabelBegin,
        beforeLabelEnd,
        afterLabelEnd,
        beforeInputBegin,
        afterInputBegin,
        beforeInputEnd,
        afterInputEnd
      } = cfg

      const id = createID({ prefix: 'input' })
      const attributes = cfg.attributes ?? {}
      const type = attributes.type ?? 'text'

      delete attributes.type

      return html`
        <div>
          ${label && html`
            ${!!beforeLabelBegin && beforeLabelBegin}

            <div class="label_wrapper">
              ${!!afterLabelBegin && afterLabelBegin}
              <label for="${id}">${label}</label>
              ${!!beforeLabelEnd && beforeLabelEnd}
            </div>
            
            ${!!afterLabelEnd && afterLabelEnd}
          `}

          ${!!beforeInputBegin && beforeInputBegin}

          <div class="input_wrapper">
            ${!!afterInputBegin && afterInputBegin}
            
            ${html`<input id="${id}">`.config({
              attributes: {
                type,
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              },

              on: on ?? {}
            })}
            
            ${!!beforeInputEnd && beforeInputEnd}
          </div>

          ${!!afterInputEnd && afterInputEnd}
        </div>
      `.setAttributes({
        class: [cfg.class, type, 'input', 'control'].filter(Boolean),
        disabled: attributes.disabled ?? false,
        invalid: attributes.invalid ?? false
      })   
    }
  }
}

export const textareaControl = {
  name: 'Jet Textarea Control',
  
  install ({ createID, html }, Components) {
    Components.textareaControl = cfg => {
      const {
        label,
        on,
        value,
        beforeLabelBegin,
        afterLabelBegin,
        beforeLabelEnd,
        afterLabelEnd,
        beforeInputBegin,
        afterInputBegin,
        beforeInputEnd,
        afterInputEnd
      } = cfg

      const id = createID({ prefix: 'textarea' })
      const attributes = cfg.attributes ?? {}

      delete attributes.type

      return html`
        <div>
          ${label && html`
            ${!!beforeLabelBegin && beforeLabelBegin}

            <div class="label_wrapper">
              ${!!afterLabelBegin && afterLabelBegin}
              <label for="${id}">${label}</label>
              ${!!beforeLabelEnd && beforeLabelEnd}
            </div>
            
            ${!!afterLabelEnd && afterLabelEnd}
          `}

          ${!!beforeInputBegin && beforeInputBegin}

          <div class="input_wrapper">
            ${!!afterInputBegin && afterInputBegin}
            
            ${html`<textarea id="${id}">${value ?? ''}</textarea>`.config({
              attributes: {
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              },

              on: on ?? {}
            })}
            
            ${!!beforeInputEnd && beforeInputEnd}
          </div>

          ${!!afterInputEnd && afterInputEnd}
        </div>
      `.setAttributes({
        class: [cfg.class, 'textarea', 'control'].filter(Boolean),
        disabled: attributes.disabled ?? false,
        invalid: attributes.invalid ?? false
      })   
    }
  }
}

export const toggleControl = {
  name: 'Jet Toggle Control',
  
  install ({ createID, html }, Components) {
    Components.toggleControl = cfg => {
      const {
        label,
        on,
        beforeLabelBegin,
        afterLabelBegin,
        beforeLabelEnd,
        afterLabelEnd,
        beforeInputBegin,
        afterInputBegin,
        beforeInputEnd,
        afterInputEnd
      } = cfg

      const id = createID({ prefix: 'toggle' })
      const attributes = cfg.attributes ?? {}
      delete attributes.type

      return html`
        <div>
          ${!!beforeInputBegin && beforeInputBegin}

          <div class="input_wrapper">
            ${!!afterInputBegin && afterInputBegin}
            
            ${html`<input type="checkbox" id="${id}">`.config({
              attributes: {
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              },

              on: on ?? {}
            })}
            
            ${!!beforeInputEnd && beforeInputEnd}
          </div>

          ${!!afterInputEnd && afterInputEnd}

          ${label && html`
            ${!!beforeLabelBegin && beforeLabelBegin}

            <div class="label_wrapper">
              ${!!afterLabelBegin && afterLabelBegin}
              <label for="${id}">${label}</label>
              ${!!beforeLabelEnd && beforeLabelEnd}
            </div>
            
            ${!!afterLabelEnd && afterLabelEnd}
          `}
        </div>
      `.setAttributes({
        class: [cfg.class, 'toggle', 'input', 'control'].filter(Boolean),
        disabled: attributes.disabled ?? false,
        invalid: attributes.invalid ?? false
      })   
    }
  }
}

export const selectControl = {
  name: 'Jet Select Control',
  
  install ({ createID, html }, Components) {
    Components.selectControl = cfg => {
      const {
        label,
        options,
        on,
        beforeLabelBegin,
        afterLabelBegin,
        beforeLabelEnd,
        afterLabelEnd,
        beforeInputBegin,
        afterInputBegin,
        beforeInputEnd,
        afterInputEnd
      } = cfg

      const id = createID({ prefix: 'select' })
      const attributes = cfg.attributes ?? {}

      return html`
        <div>
          ${label && html`
            ${!!beforeLabelBegin && beforeLabelBegin}

            <div class="label_wrapper">
              ${!!afterLabelBegin && afterLabelBegin}
              <label for="${id}">${label}</label>
              ${!!beforeLabelEnd && beforeLabelEnd}
            </div>
            
            ${!!afterLabelEnd && afterLabelEnd}
          `}

          ${!!beforeInputBegin && beforeInputBegin}

          <div class="input_wrapper">
            ${!!afterInputBegin && afterInputBegin}
            
            ${html`
              <select id="${id}">
                ${(options ?? []).map(({ label, value, selected }) => html`
                  <option>${label}</option>  
                `.set({
                  attributes: {
                    value: value ?? ''
                  },

                  properties: {
                    selected: selected === true
                  }
                }))}
              </select>
            `.config({
              attributes: {
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              },

              on: on ?? {}
            })}
            
            ${!!beforeInputEnd && beforeInputEnd}
          </div>

          ${!!afterInputEnd && afterInputEnd}
        </div>
      `.setAttributes({
        class: [cfg.class, 'select', 'input', 'control'].filter(Boolean),
        disabled: attributes.disabled ?? false,
        invalid: attributes.invalid ?? false
      })   
    }
  }
}

export default [
  inputControl,
  selectControl,
  textareaControl,
  toggleControl
]