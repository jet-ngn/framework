import { typeOf, NANOID } from '@ngnjs/libdata'
import { sanitizeString } from '../utilities/StringUtils.js'
import Template from '../Template.js'
import Node from '../Node.js'
import { makeEntity } from '../Entity.js'
import { reconcileNodes } from '../Reconciler.js'

// import DataCollection from '../../data/DataCollection.js'
// import DataModel from '../../data/DataModel.js'
// import DataStore from '../../data/DataStore.js'

const targets = {}
const trackers = {}

class Tracker {
  #target
  #property
  #transform

  constructor (target, property, transform) {

  }
}

export default class TrackerRegistry {
  static register (target, property, transform) {
    const id = NANOID()

    const tracker = {
      type: 'tracker',
      id, target, property, transform
    }

    trackers[id] = tracker
    return tracker
  }
}

// class Tracker {
//   #id = NANOID()
//   #fragment
//   #target
//   #property
//   #transformFn
//   #rendered = false
//   nodes = null

//   constructor (fragment, { target, property, transformFn }) {
//     this.#fragment = fragment
//     this.#target = target
//     this.#property = property
//     this.#transformFn = transformFn ?? null
//   }

//   get id () {
//     return this.#id
//   }

//   get options () {
//     return this.#fragment.options
//   }

//   get property () {
//     return this.#property
//   }

//   get target () {
//     return this.#target
//   }

//   set target (target) {
//     this.#target = target
//   }

//   get transformFn () {
//     return this.#transformFn
//   }

//   get output () {
//     const value = this.#target[this.#property]
//     return this.#transformFn ? this.#transformFn(value) : value
//   }

//   async render (target) {
//     if (this.#rendered) {
//       throw new Error(`Tracker "${this.#id}" has already been rendered`)
//     }

//     this.nodes = [target]
//     this.#rendered = true
//     await this.update()
//   }
// }

// class ContentTracker extends Tracker {
//   async update () {
//     const { output, nodes } = this

//     if (output instanceof Template) {
//       return console.log('HANDLE TEMPLATE')
//     }
//     console.log(this);
//     this.nodes = reconcileNodes(this.nodes, getReplacement(output, this.options))
//   }
// }

// class TrackedObject {
//   #trackers = []
//   #revocable

//   constructor (obj) {
//     this.#revocable = Proxy.revocable(obj, {
//       set: value => {
//         console.log('UPDATE TRACKERS')
//       }
//     })
//   }

//   get trackers () {
//     return this.#trackers
//   }

//   get proxy () {
//     return this.#revocable.proxy
//   }

//   addTracker (tracker) {
//     this.#trackers.push(tracker)
//   }

//   release () {
//     console.log('RELEASE ALL TRACKERS')
//     this.#revocable.revoke()
//   }
// }

// class TrackerRegistry {
//   // #entities = new Map
//   #trackers = {}
//   // #targets = new Map

//   get (id) {
//     return this.#trackers[id]
//   }

//   registerContentTracker (fragment, interpolation) {
//     interpolation.target = 'hey'
//     // interpolation.target = 'test'
//     console.log(interpolation);
//     // return this.#register(new ContentTracker(...arguments))
//   }

// //   #register (tracker) {
// //     let { id } = tracker

// //     if (tracker.target instanceof TrackedObject) {
// //       return console.log('HANDLE EXISTING TRACKED OBJECT')
// //     }

// //     const trackedObject = new TrackedObject(tracker.target)
// //     trackedObject.addTracker(tracker)

// //     tracker.target = trackedObject.proxy
// //     this.#trackers[id] = tracker

// //     return tracker

// //     // this.#trackers[id] = tracker
// //     // let registeredTarget = this.#targets.get(target)

// //     // if (!registeredTarget) {
// //     //   registeredTarget = this.#track(target, tracker)
// //     // }

// // //     if (!!registeredTarget) {
// // //       if (registeredTarget.hasOwnProperty(property)) {
// // //         registeredTarget[property].push(tracker)
// // //       } else {
// // //         registeredTarget[property] = [tracker]
// // //       }
// // //     } else {
// // //       this.#targets.set(target, {
// // //         [property]: [tracker]
// // //       })

// // //       registeredTarget = this.#targets.get(target)
// // //       this.#track(tracker, this.#targets.get(target))
// // //     }

// // //     const registeredContext = this.#contexts.get(tracker.context)

// // //     if (!registeredContext) {
// // //       this.#contexts.set(tracker.context, [registeredTarget])      
// // //     } else {
// // //       registeredContext.push(registeredTarget)
// // //     }

// // //     return tracker
// //   }
// }

// export default new TrackerRegistry

// class TrackerRegistry {
//   #contexts = new Map
//   #trackers = {}
//   #targets = new Map

//   getNodes (id) {
//     const tracker = this.get(id)

//     if (!tracker) {
//       throw new ReferenceError(`Tracker "${id}" not found`)
//     }

//     return tracker.nodes
//   }

//   get (id) {
//     return this.#trackers[id]
//   }

//   registerAttributeListWithTrackers (context, node, attribute, list, collection) {
//     const listTracker = new AttributeListTracker(...arguments)
//     listTracker.trackers.forEach(this.#register.bind(this))
//     return listTracker
//   }

//   registerAttributeTracker (context, node, name, cfg, collection) {
//     return this.#register(new AttributeTracker(...arguments))
//   }

//   registerContentTracker (fragment, tracker) {
//     return this.#register(new ContentTracker(...arguments))
//   }

//   registerEntityTracker (context, node, cfg, options, collection) {
//     return this.#register(new EntityTracker(...arguments))
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

//       set: async (val) => {
//         result = val

//         for (let tracker of registeredTarget[property]) {
//           await tracker.update()
//         }
//         // registeredTarget[property].forEach(tracker => tracker.update())
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

// function getReplacement (output, options) {
//   if (Array.isArray(output)) {
//     return console.log('HANDLE ARRAY')
//   }

//   switch (typeof output) {
//     case 'string':
//     case 'number': return [document.createTextNode(sanitizeString(output, options))]
  
//     default: throw new TypeError(`Unsupported tracker content type "${typeof output}"`)
//   }
// }

// class ArrayTracker extends Tracker {
//   #nodes
//   #placeholder

//   constructor (context, cfg, options) {
//     super(...arguments)
//     this.#placeholder = document.createComment(this.id)
//     this.#nodes = this.value.length === 0 ? [this.#placeholder] : this.value.map(node => this.#render(node))
//   }

//   get nodes () {
//     return this.#nodes
//   }

//   get type () {
//     return 'array'
//   }

//   pop () {
//     this.#nodes.at(-1).remove()
//     this.#nodes.pop()
//   }

//   push () {
//     const node = this.#render(this.value.at(-1))
//     const last = this.#nodes.at(-1)

//     if (last === this.#placeholder) {
//       last.replaceWith(node)
//     } else {
//       last.after(node)
//     }

//     this.#nodes.push(node)
//   }

//   reconcile () {
//     reconcileNodes(this.#nodes, this.value.map(node => this.#render(node)))
//   }

//   shift () {
//     this.#nodes[0].remove()
//     this.#nodes.shift()
//   }

//   sort () {
//     console.log('sort')
//   }

//   unshift () {
//     const node = this.#render(this.value[0])
//     this.#nodes.at(0).before(node)
//     this.#nodes.unshift(node)
//   }

//   #render (item) {
//     // const { retainFormatting } = this

//     // if (typeof item === 'string') {
//     //   return document.createTextNode(sanitizeString(item, { retainFormatting }))
//     // }

//     // const string = parseTag(item, {
//     //   retainFormatting,
//     //   trackers: this.context
//     // })

//     // return getDOMFragment(item.type, string, { trackers: this.context }).childNodes[0]
//   }
// }

// class BooleanTracker extends Tracker {
//   #nodes

//   constructor (context, { target, property, transformFn }, options) {
//     super(...arguments)
//     this.#nodes = this.#render()
//   }

//   get nodes () {
//     return this.#nodes
//   }

//   get type () {
//     return 'boolean'
//   }

//   update () {
//     const { value } = this

//     if (typeof value === 'string') {
//       return this.#nodes.forEach(node => node.data = node.data === value ? node.data : value)
//     }

//     reconcileNodes(this.#nodes, this.#render())
//   }

//   #render () {
//     const { value } = this

//     if (typeof value === 'boolean') {
//       return [value === true ? 'true' : 'false']
//     }
    
//     return [document.createTextNode('RENDER TEMPLATE')]
//   }
// }

// class AttributeListItemTracker extends Tracker {
//   #parent

//   constructor (context, parent, cfg) {
//     super(context, cfg)
//     this.#parent = parent
//   }

//   update () {
//     this.#parent.update()
//   }
// }

// class AttributeListTracker {
//   #context
//   #node
//   #attribute
//   #list
//   #trackers = new Map

//   constructor (context, node, attribute, list) {
//     this.#context = context
//     this.#node = node
//     this.#attribute = attribute
//     this.#list = list.map(item => {
//       const type = typeOf(item)

//       switch (type) {
//         case 'string':
//         case 'number': return `${item}`
//         case 'object': 
//           const tracker = new AttributeListItemTracker(context, this, item)
//           this.#trackers.set(tracker, item.value)
//           return tracker

//         default: throw new TypeError(`Invalid list item type "${type}"`)
//       }
//     })
//   }

//   get trackers () {
//     return [...this.#trackers.keys()]
//   }

//   update () {
//     this.#node.setAttribute(this.#attribute, this.#list.reduce((list, item) => {
//       if (item instanceof Tracker) {
//         if (typeof item.value === 'boolean') {
//           if (item.value === true) {
//             list.push(this.#trackers.get(item))
//           }
//         } else {
//           list.push(item.value)
//         }
//       } else {
//         list.push(item)
//       }

//       return list
//     }, []).join(' '))
//   }
// }

// class AttributeTracker extends Tracker {
//   #node
//   #name

//   constructor (context, node, name, cfg) {
//     super(context, cfg)
//     this.#node = node
//     this.#name = name
//   }

//   get name () {
//     return this.#name
//   }

//   get node () {
//     return this.#node
//   }

//   update () {
//     const { value } = this

//     if (typeof value === 'boolean') {
//       return value ? this.#node.setAttribute(this.#name, '') : this.#node.removeAttribute(this.#name)
//     }

//     this.#node.setAttribute(this.#name, value)
//   }
// }

// class EntityTracker extends Tracker {
//   #node
//   #current = null

//   constructor (context, node, cfg, options, collection) {
//     super(context, cfg, options, collection)
//     this.#node = node
//   }

//   get type () {
//     return 'entity'
//   }

//   async update () {
//     const update = makeEntity(new Node(this.#node), this.value, this.context)

//     this.collection.splice(this.collection.indexOf(this.#current), 1, update)

//     if (this.#current) {
//       this.#current.unmount()
//     }

//     this.#current = update
//     await update.mount()
//   }
// }

// export default new TrackerRegistry

// // export default class TrackerRegistry {
// //   #context
// //   #targets = new Map
// //   #trackers = {}
// //   #retainFormatting = false

// //   constructor (context, cfg) {
// //     this.#context = context
// //     this.#retainFormatting = cfg.retainFormatting === true
// //   }

// //   get hasTrackers () {
// //     return this.#targets.size > 0
// //   }

// //   getNodes (id) {
// //     const tracker = this.#trackers[id]

// //     if (!tracker) {
// //       throw new ReferenceError(`Tracker "${id}" not found`)
// //     }

// //     return tracker.nodes
// //   }

// //   get (id) {
// //     return this.#targets[id]
// //   }

// //   registerAttributeTracker (node, name, cfg) {
// //     return this.#register(new AttributeTracker(this.#context, ...arguments))
// //   }

// //   registerAttributeListWithTrackers (node, attribute, list) {
// //     const listTracker = new AttributeListTracker(this.#context, ...arguments)
// //     listTracker.trackers.forEach(this.#register.bind(this))
// //     return listTracker
// //   }

// //   registerEntityTracker (node, cfg) {
// //     return this.#register(new EntityTracker(this.#context, ...arguments, this.#retainFormatting))
// //   }

// //   registerContentTracker (cfg) {
// //     return this.#register(this.#getContentTracker(...arguments))
// //   }

// //   #getContentTracker ({ target, property, transformFn }) {
// //     const type = typeOf(target[property])

// //     switch (type) {
// //       case 'string':
// //       case 'number': return new StringTracker(this.#context, arguments[0], this.#retainFormatting) 
// //       case 'array': return new ArrayTracker(this.#context, arguments[0], this.#retainFormatting)
    
// //       default: throw new TypeError(`Unsupported tracker type "${type}"`)
// //     }
// //   }

// //   #register (tracker) {
// //     const { id, target, property } = tracker
// //     this.#trackers[id] = tracker
// //     let registered = this.#targets.get(target)

// //     if (!!registered) {
// //       if (registered.hasOwnProperty(property)) {
// //         registered[property].push(tracker)
// //       } else {
// //         registered[property] = [tracker]
// //       }
// //     } else {
// //       this.#targets.set(target, {
// //         [property]: [tracker]
// //       })

// //       this.#track(tracker, this.#targets.get(target))
// //     }

// //     return tracker
// //   }

// //   #track (tracker, registeredTarget) {
// //     if (tracker instanceof ArrayTracker) {
// //       return this.#trackArray(...arguments)
// //     }

// //     let { target, property, value } = tracker
// //     let result = target[property]
// //     delete target[property]

// //     Object.defineProperty(target, property, {
// //       get: () => result,

// //       set: val => {
// //         result = val
// //         registeredTarget[property].forEach(tracker => tracker.update())
// //       }
// //     })
// //   }

// //   #trackArray (tracker, registeredTarget) {
// //     let { target, property } = tracker
    
// //     target[property] = new Proxy(target[property], {
// //       get: (target, property) => {
// //         const original = target[property]

// //         switch (property) {
// //           case 'pop':
// //           case 'push':
// //           case 'shift':
// //           case 'unshift': return (...args) => {
// //             original.apply(target, args)
// //             registeredTarget[tracker.property].forEach(tracker => tracker[property]())
// //           }

// //           case 'copyWithin':
// //           case 'fill':
// //           case 'reverse':
// //           case 'sort':
// //           case 'splice': return (...args) => {
// //             original.apply(target, args)
// //             registeredTarget[tracker.property].forEach(tracker => tracker.reconcile())
// //           }
        
// //           default: return original
// //         }
// //       }
// //     })
// //   }
// // }







