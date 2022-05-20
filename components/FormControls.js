export const InputControl = {
  name: 'Jet Input Control',
  
  install ({ createID, html }, Components) {
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

export const ToggleControl = {
  name: 'Jet Toggle Control',
  
  install ({ createID, html }, Components) {
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

export const SelectControl = {
  name: 'Jet Select Control',
  
  install ({ createID, html }, Components) {
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

      const id = createID({ prefix: 'select' })
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

export default [
  InputControl,
  SelectControl,
  ToggleControl
]