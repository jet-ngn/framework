import { html, svg } from '../../parser/tags'

export default class IconManager {
  #icons
  #width
  #height
  #stroke
  
  #default = svg`
    <path id="Path_5" data-name="Path 5" d="M0,0H6" transform="translate(9 3)" fill="none" stroke="#000" stroke-width="2"/>
    <path id="Path_7" data-name="Path 7" d="M0,0H6" transform="translate(21 9) rotate(90)" fill="none" stroke="#000" stroke-width="2"/>
    <path id="Path_8" data-name="Path 8" d="M0,0H6" transform="translate(9 21)" fill="none" stroke="#000" stroke-width="2"/>
    <path id="Path_6" data-name="Path 6" d="M0,0H6" transform="translate(3 9) rotate(90)" fill="none" stroke="#000" stroke-width="2"/>
    <path id="Path_1" data-name="Path 1" d="M17,3h4V7" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="2"/>
    <path id="Path_4" data-name="Path 4" d="M21,3H17V7" transform="translate(-14)" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="2"/>
    <path id="Path_2" data-name="Path 2" d="M17,3h4V7" transform="translate(24) rotate(90)" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="2"/>
    <path id="Path_3" data-name="Path 3" d="M0,4H4V0" transform="translate(7 17) rotate(90)" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="2"/>
  `

  constructor ({ icons, width, height, stroke, fill }) {
    this.#width = width ?? 24
    this.#height = height ?? this.#width
    this.#stroke = stroke ?? 'currentColor'
    this.#icons = icons ?? {}
  }

  get (name) {
    let icon = this.#icons[name]

    if (!icon) {
      console.warn(`Icon "${name}" not found`)
    }

    return html`
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.#width}" height="${this.#height}" viewBox="0 0 ${this.#width} ${this.#height}" fill="none" stroke="${this.#stroke}" stroke-width="2">
        ${ icon ?? this.#default}
      </svg>
    `.setAttributes({
      class: [name, 'icon']
    })
  }
}