import Parser from '../Parser'
import { PATH } from '../env'

export function renderTemplate (template, ast, parserConfig) {
  const parser = new Parser(parserConfig)
  meta.score++

  switch (template.type) {
    case 'html': return renderHTML(template, parser, ast)
    case 'svg': return renderSVG(template, parser, ast)
  
    default: throw new TypeError(`Invalid template type "${template.type}"`)
  }
}

function renderHTML (template, parser, ast) {
  const fragment = parser.parse(template)
  const root = fragment.firstElementChild
  
  if (!root) {
    return fragment
  }

  const hasMultipleRoots = fragment.children.length > 1
  let { attributes, listeners, properties, config, routes } = template
  const args = [root, hasMultipleRoots]

  // !!attributes && this.#bind('attributes', attributes, ...args, this.#setAttribute)
  // !!properties && this.#bind('properties', properties, ...args, this.#setProperty)
  // !!listeners && this.#bindListeners(listeners, ...args)

  if (routes) {
    console.log('HANDLE ROUTER')
    return fragment
  }

  if (config) {
    // console.log('HANDLE NESTED CONFIG')
    return fragment
  }

  const { templates, trackers } = parser

  // console.log('HANDLE NESTED TRACKERS')
  // console.log('HANDLE NESTED TEMPLATES')

  return fragment
}

function renderSVG (fragment, ast) {

}