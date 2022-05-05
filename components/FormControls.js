export const InputControl = {
  name: 'Jet Input Control',
  
  install ({ html, createID }, Components) {
    Components.InputControl = cfg => {
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

      const id = `input_${createID()}`
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
            
            ${html`<input id="${id}">`
              .setAttributes({
                type,
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              })
              .on(on ?? {})
            }
            
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

export const ToggleControl = {
  name: 'Jet Toggle Control',
  
  install ({ html, createID }, Components) {
    Components.ToggleControl = cfg => {
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

      const id = `input_${createID()}`
      const attributes = cfg.attributes ?? {}
      delete attributes.type

      return html`
        <div>
          ${!!beforeInputBegin && beforeInputBegin}

          <div class="input_wrapper">
            ${!!afterInputBegin && afterInputBegin}
            
            ${html`<input type="checkbox" id="${id}">`
              .setAttributes({
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              })
              .on(on ?? {})
            }
            
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

export const SelectControl = {
  name: 'Jet Select Control',
  
  install ({ html, createID }, Components) {
    Components.SelectControl = cfg => {
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

      const id = `input_${createID()}`
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
            
            ${html`
              <select id="${id}">
                ${(options ?? []).map(({ label, value, selected }) => html`
                  <option>${label}</option>  
                `
                  .setAttribute('value', value ?? '')
                  .setProperty('selected', selected === true))
                }
              </select>
            `.setAttributes({
                type,
                autocomplete: attributes.autocomplete ?? 'off',
                ...attributes
              })
              .on(on ?? {})
            }
            
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

export default [
  InputControl,
  SelectControl,
  ToggleControl
]