import { typeOf, NANOID } from '@ngnjs/libdata'
import { sanitizeString } from '../utilities/StringUtils.js'
import Node from '../Node.js'
import { makeEntity } from '../Entity.js'
import { reconcileNodes } from '../Reconciler.js'

// import DataCollection from '../../data/DataCollection.js'
// import DataModel from '../../data/DataModel.js'
// import DataStore from '../../data/DataStore.js'

class Tracker {
  #id = NANOID()
  #context
  #target
  #property
  #transformFn
  #retainFormatting

  constructor (context, { target, property, transformFn }, options) {
    this.#context = context
    this.#target = target
    this.#property = property
    this.#transformFn = transformFn ?? null
    this.#retainFormatting = options?.retainFormatting === true
  }

  get context () {
    return this.#context
  }

  get id () {
    return this.#id
  }

  get target () {
    return this.#target
  }

  get property () {
    return this.#property
  }

  get retainFormatting () {
    return this.#retainFormatting
  }

  get transformFn () {
    return this.#transformFn
  }

  get value () {
    const value = this.#target[this.#property]
    return this.#transformFn ? this.#transformFn(value) : value
  }
}

export class ArrayTracker extends Tracker {
  #nodes
  #placeholder

  constructor (context, cfg, options) {
    super(...arguments)
    this.#placeholder = document.createComment(this.id)
    this.#nodes = this.value.length === 0 ? [this.#placeholder] : this.value.map(node => this.#render(node))
  }

  get nodes () {
    return this.#nodes
  }

  get type () {
    return 'array'
  }

  pop () {
    this.#nodes.at(-1).remove()
    this.#nodes.pop()
  }

  push () {
    const node = this.#render(this.value.at(-1))
    const last = this.#nodes.at(-1)

    if (last === this.#placeholder) {
      last.replaceWith(node)
    } else {
      last.after(node)
    }

    this.#nodes.push(node)
  }

  reconcile () {
    reconcileNodes(this.#nodes, this.value.map(node => this.#render(node)))
  }

  shift () {
    this.#nodes[0].remove()
    this.#nodes.shift()
  }

  sort () {
    console.log('sort')
  }

  unshift () {
    const node = this.#render(this.value[0])
    this.#nodes.at(0).before(node)
    this.#nodes.unshift(node)
  }

  #render (item) {
    // const { retainFormatting } = this

    // if (typeof item === 'string') {
    //   return document.createTextNode(sanitizeString(item, { retainFormatting }))
    // }

    // const string = parseTag(item, {
    //   retainFormatting,
    //   trackers: this.context
    // })

    // return getDOMFragment(item.type, string, { trackers: this.context }).childNodes[0]
  }
}

class AttributeListItemTracker extends Tracker {
  #parent

  constructor (context, parent, cfg) {
    super(context, cfg)
    this.#parent = parent
  }

  update () {
    this.#parent.update()
  }
}

class AttributeListTracker {
  #context
  #node
  #attribute
  #list
  #trackers = new Map

  constructor (context, node, attribute, list) {
    this.#context = context
    this.#node = node
    this.#attribute = attribute
    this.#list = list.map(item => {
      const type = typeOf(item)

      switch (type) {
        case 'string':
        case 'number': return `${item}`
        case 'object': 
          const tracker = new AttributeListItemTracker(context, this, item)
          this.#trackers.set(tracker, item.value)
          return tracker

        default: throw new TypeError(`Invalid list item type "${type}"`)
      }
    })
  }

  get trackers () {
    return [...this.#trackers.keys()]
  }

  update () {
    this.#node.setAttribute(this.#attribute, this.#list.reduce((list, item) => {
      if (item instanceof Tracker) {
        if (typeof item.value === 'boolean') {
          if (item.value === true) {
            list.push(this.#trackers.get(item))
          }
        } else {
          list.push(item.value)
        }
      } else {
        list.push(item)
      }

      return list
    }, []).join(' '))
  }
}

export class AttributeTracker extends Tracker {
  #node
  #name

  constructor (context, node, name, cfg) {
    super(context, cfg)
    this.#node = node
    this.#name = name
  }

  get name () {
    return this.#name
  }

  get node () {
    return this.#node
  }

  update () {
    const { value } = this

    if (typeof value === 'boolean') {
      return value ? this.#node.setAttribute(this.#name, '') : this.#node.removeAttribute(this.#name)
    }

    this.#node.setAttribute(this.#name, value)
  }
}

export class EntityTracker extends Tracker {
  #node
  #current = null
  #collection = null

  constructor (context, node, cfg, options, collection) {
    super(context, cfg, options)
    this.#node = node
    this.#collection = collection
  }

  get type () {
    return 'entity'
  }

  async update () {
    const update = makeEntity(new Node(this.#node), this.value, this.context)

    this.#collection.splice(this.#collection.indexOf(this.#current), 1, update)

    if (this.#current) {
      this.#current.unmount()
    }

    this.#current = update
    await update.mount()
  }
}

class StringTracker extends Tracker {
  #nodes

  constructor () {
    super(...arguments)
    this.#nodes = this.#render()
  }

  get nodes () {
    return this.#nodes
  }

  get type () {
    return 'string'
  }

  get value () {
    return sanitizeString(super.value, { retainFormatting: this.retainFormatting })
  }

  update () {
    const { value } = this

    if (typeof value === 'string') {
      return this.#nodes.forEach(node => node.data = node.data === value ? node.data : value)
    }

    reconcileNodes(this.#nodes, this.#render())
  }

  #render () {
    const { value } = this

    if (typeof value === 'string') {
      return [document.createTextNode(value)]
    }

    // Should be a tag
    console.log(value);

    // const string = parseTag(value, {
    //   retainFormatting,
    //   trackers: this.context,
    // })

    // return [...žgetDOMFragment(value.type, string, { trackers: this.context }).childNodes]
  }
}

class TrackerRegistry {
  #contexts = new Map
  #trackers = {}
  #targets = new Map

  getNodes (id) {
    const tracker = this.#trackers[id]

    if (!tracker) {
      throw new ReferenceError(`Tracker "${id}" not found`)
    }

    return tracker.nodes
  }

  registerAttributeListWithTrackers (context, node, attribute, list) {
    const listTracker = new AttributeListTracker(...arguments)
    listTracker.trackers.forEach(this.#register.bind(this))
    return listTracker
  }

  registerAttributeTracker (context, node, name, cfg) {
    return this.#register(new AttributeTracker(...arguments))
  }

  registerContentTracker (context, cfg, options) {
    return this.#register(this.#getContentTracker(...arguments))
  }

  registerEntityTracker (context, node, cfg, options, collection) {
    return this.#register(new EntityTracker(...arguments))
  }

  #getContentTracker (context, cfg, options) {
    const { target, property } = cfg

    const type = typeOf(target[property])

    switch (type) {
      case 'string':
      case 'number': return new StringTracker(...arguments) 
      case 'array': return new ArrayTracker(...arguments)
    
      default: throw new TypeError(`Unsupported tracker type "${type}"`)
    }
  }

  #register (tracker) {
    const { id, target, property } = tracker
    this.#trackers[id] = tracker
    let registeredTarget = this.#targets.get(target)

    if (!!registeredTarget) {
      if (registeredTarget.hasOwnProperty(property)) {
        registeredTarget[property].push(tracker)
      } else {
        registeredTarget[property] = [tracker]
      }
    } else {
      this.#targets.set(target, {
        [property]: [tracker]
      })

      registeredTarget = this.#targets.get(target)
      this.#track(tracker, this.#targets.get(target))
    }

    const registeredContext = this.#contexts.get(tracker.context)

    if (!registeredContext) {
      this.#contexts.set(tracker.context, [registeredTarget])      
    } else {
      registeredContext.push(registeredTarget)
    }

    return tracker
  }

  #track (tracker, registeredTarget) {
    // if (tracker instanceof ArrayTracker) {
    //   return this.#trackArray(...arguments)
    // }

    let { target, property, value } = tracker
    let result = target[property]
    delete target[property]

    Object.defineProperty(target, property, {
      get: () => result,

      set: val => {
        result = val
        registeredTarget[property].forEach(tracker => tracker.update())
      }
    })
  }
}

export default new TrackerRegistry

// export default class TrackerRegistry {
//   #context
//   #targets = new Map
//   #trackers = {}
//   #retainFormatting = false

//   constructor (context, cfg) {
//     this.#context = context
//     this.#retainFormatting = cfg.retainFormatting === true
//   }

//   get hasTrackers () {
//     return this.#targets.size > 0
//   }

//   getNodes (id) {
//     const tracker = this.#trackers[id]

//     if (!tracker) {
//       throw new ReferenceError(`Tracker "${id}" not found`)
//     }

//     return tracker.nodes
//   }

//   get (id) {
//     return this.#targets[id]
//   }

//   registerAttributeTracker (node, name, cfg) {
//     return this.#register(new AttributeTracker(this.#context, ...arguments))
//   }

//   registerAttributeListWithTrackers (node, attribute, list) {
//     const listTracker = new AttributeListTracker(this.#context, ...arguments)
//     listTracker.trackers.forEach(this.#register.bind(this))
//     return listTracker
//   }

//   registerEntityTracker (node, cfg) {
//     return this.#register(new EntityTracker(this.#context, ...arguments, this.#retainFormatting))
//   }

//   registerContentTracker (cfg) {
//     return this.#register(this.#getContentTracker(...arguments))
//   }

//   #getContentTracker ({ target, property, transformFn }) {
//     const type = typeOf(target[property])

//     switch (type) {
//       case 'string':
//       case 'number': return new StringTracker(this.#context, arguments[0], this.#retainFormatting) 
//       case 'array': return new ArrayTracker(this.#context, arguments[0], this.#retainFormatting)
    
//       default: throw new TypeError(`Unsupported tracker type "${type}"`)
//     }
//   }

//   #register (tracker) {
//     const { id, target, property } = tracker
//     this.#trackers[id] = tracker
//     let registered = this.#targets.get(target)

//     if (!!registered) {
//       if (registered.hasOwnProperty(property)) {
//         registered[property].push(tracker)
//       } else {
//         registered[property] = [tracker]
//       }
//     } else {
//       this.#targets.set(target, {
//         [property]: [tracker]
//       })

//       this.#track(tracker, this.#targets.get(target))
//     }

//     return tracker
//   }

//   #track (tracker, registeredTarget) {
//     if (tracker instanceof ArrayTracker) {
//       return this.#trackArray(...arguments)
//     }

//     let { target, property, value } = tracker
//     let result = target[property]
//     delete target[property]

//     Object.defineProperty(target, property, {
//       get: () => result,

//       set: val => {
//         result = val
//         registeredTarget[property].forEach(tracker => tracker.update())
//       }
//     })
//   }

//   #trackArray (tracker, registeredTarget) {
//     let { target, property } = tracker
    
//     target[property] = new Proxy(target[property], {
//       get: (target, property) => {
//         const original = target[property]

//         switch (property) {
//           case 'pop':
//           case 'push':
//           case 'shift':
//           case 'unshift': return (...args) => {
//             original.apply(target, args)
//             registeredTarget[tracker.property].forEach(tracker => tracker[property]())
//           }

//           case 'copyWithin':
//           case 'fill':
//           case 'reverse':
//           case 'sort':
//           case 'splice': return (...args) => {
//             original.apply(target, args)
//             registeredTarget[tracker.property].forEach(tracker => tracker.reconcile())
//           }
        
//           default: return original
//         }
//       }
//     })
//   }
// }







