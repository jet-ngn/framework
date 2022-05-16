import Entity from './Entity'
import { TreeRoot } from './Tree'
import Router from './Router'
import { getSlugs } from './utilities/RouteUtils'
import { renderTemplate } from './utilities/RenderUtils'
import { PATH } from './env'

function mount ({ type, target, children }) {
  children.forEach(mount)
  type === 'entity' && target.emit(INTERNAL_ACCESS_KEY, 'mount')
}

function unmount ({ type, target, children }) {
  children.forEach(unmount)

  if (type === 'entity') {
    target.emit(INTERNAL_ACCESS_KEY, 'unmount')
    EventRegistry.removeByEntity(target)
  }
}

export default class Application extends Entity(TreeRoot) {
  constructor (root, config) {
    super(null, ...arguments, 'app')

    console.log('=================================')
    console.log('MOUNT ENTITIES')
  }

  get baseURL () {
    return PATH.base.pathname
  }

  // render (config) {
  //   let meta = {
  //     score: 0,
  //     needed: getSlugs(PATH.current).length
  //   }

  //   let { fragment, score } = renderTemplate(Reflect.get(this.#config, 'template', this), this.#children, { retainFormatting: this.root.tagName === 'PRE' })

  //   console.log(meta)
  //   console.log(fragment)

  //   if (!PATH.remaining) {
  //     console.log('NO PATH. RENDER TEMPLATE')
  //     return this.root.replaceChildren(fragment)
  //   }

  //   console.log('HAS PATH.')

  //   if (!this.#router) {
  //     console.log('...BUT NO ROUTER. RENDER TEMPLATE')
  //     return this.root.replaceChildren(fragment)
  //   }

  //   // console.log('COMPARE ROUTES AND TEMPLATES FOR BEST MATCH')
  //   // PATH.slugs = getSlugs(PATH.current)
  //   // const fragment = document.createDocumentFragment()
  //   // let bestScore = 0



  //   // console.log('mount results')
  //   // // this.#children.forEach(mount)
  //   // // this.emit(INTERNAL_ACCESS_KEY, 'mount')
  // }

  // #renderTemplate () {
  //   let template = Reflect.get(this.#config, 'template', this)
  //   // const child = generateTreeNode('entity', new Entity(parent, root, config), route)
  //   // const renderer = new Renderer(child.target, shouldRetainFormatting(root.tagName === 'PRE', root)) 

  //   // children.push(child)
  //   // return renderer.render(template, child, routes)
  // }
}