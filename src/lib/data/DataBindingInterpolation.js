import IdentifiedClass from '../IdentifiedClass'

export default class DataBindingInterpolation extends IdentifiedClass {
  #proxies
  #transform

  constructor ({ proxies, transform }) {
    super('data-binding')
    this.#proxies = proxies
    this.#transform = transform
  }

  get proxies () {
    return this.#proxies
  }

  get transform () {
    return this.#transform
  }
}

// export default class DataBindingInterpolation extends IdentifiedClass {
//   #proxies = new Map
//   #transform

//   constructor (...args) {
//     super('data-binding')
//     const firstArg = args[0]
//     console.log(Array.isArray(firstArg));

//     if (Array.isArray(firstArg)) {
//       this.#proxies.set(firstArg[0], [...firstArg.slice(1)])

//       args.slice(1).forEach((arg, index) => {
//         if (Array.isArray(arg)) {
//           this.#proxies.set(arg[0], [...arg.slice(1)])
//         } else if (typeof arg === 'function') {
//           this.#transform = arg
//         } else {
//           throw new TypeError(`Argument ${index + 1} of binding function is invalid.`)
//         }
//       })
//     } else {
//       const secondArg = args[1]
//       const props = []

//       if (typeof secondArg === 'function') {
//         this.#transform = secondArg
//       } else {
//         props.push(secondArg)
//         this.#transform = args[2] ?? (data => data[secondArg] ?? null)
//       }

//       this.#proxies.set(firstArg, props)
//     }
//   }

//   get proxies () {
//     return this.#proxies
//   }

//   get transform () {
//     return this.#transform
//   }
// }