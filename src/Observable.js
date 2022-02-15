import NGN from 'NGN'

export default function Observable (target) {
  const lookup = {}

  Object.defineProperty(lookup, 'target', {
    get: () => target,

    set: value => {
      console.log('CHANGED: ', { old: target, new: value });
      // this.emit('change', { old: target, new: value })
      target = value
    }
  })

  return lookup.target
}

// string,
// number,
// bigint,
// boolean,
// undefined,
// null

// Object,
// Array,

// Map,
// Set

// export default class Observable extends NGN.EventEmitter {
//   #target
//   #lookup = {}
  
//   constructor (target) {
//     super()
//     this.#target = target

//     Object.defineProperty(this.#lookup, 'target', {
//       get: () => this.#target,

//       set: value => {
//         this.emit('change', { old: this.#target, new: value })
//         this.#target = value
//       }
//     })
    
//     return this.#lookup.target
//   }
// }