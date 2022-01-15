// import { html } from './Tags.js'
// import JetElementNode from './JetElementNode.js'
// import Bindable from './Bindable.js'
// import Renderer from '../src-OLD/renderer/Renderer.js'

// import App from './App.js'
import Entity from './Entity.js'

export default class Tests {
  static run () {
    const hey = new Entity({
      name: 'wut'
    })

    console.log('HELLO');

    console.log(hey)

    const test = new Entity({
      name: 'test'
    })

    console.log(test)

    // let bool = true
    // let str = 'test'
    // let str2 = 'wut'

    // render.html`
    //   ${data.bind('test', test => test ? html`true` : html`false`)}
    //   ${data.bind('test', test => test && html`Hey`)}
    // `

    // const obj = new Bindable({
    //   test: 'hey',
    //   wut: 'blah',

    //   hey: {
    //     blah: true,
    //     bleh: 'nope'
    //   }
    // })

    // this.render(html`
    //   <h1>Test</h1>

    //   ${obj.hey.bind('blah') ? html`<div>blah: true</div>` : html`<div>blah: false</div>`}
    // `)

    // console.log(obj.observe('test', test => 23))

    // console.log(obj);

    // obj.on('observable.set', console.log)

    // obj.test = 'tesssst'

    // const test = new JetElementNode(document.querySelector('.test'))
    // const div = document.querySelector('.test .div')

    // const child = document.createElement('div')

    // console.log(test.contains(div));

    // test.appendChild(child)

    // test.render(html`
    //   <div>child</div>
    // `)
  }
}

// test.addEventListener('click', console.log, { once: true })

    // const listener = test.on('click', evt => {
    //   console.log('CLICKED')
    //   // test.off(listener.id)
    // }, {
    //   once: true
    // })

// NGN.BUS.on('*', function () {
//   console.log(this.event)
// })

// NGN.LEDGER.on(NGN.INTERNAL_EVENT, function (evt, payload) {
//   switch (evt) {
//     case 'ui.element.remove': return console.log('REMOVING ELEMENT', payload)
//     case 'ui.element.removed': return console.log('ELEMENT REMOVED', payload)
//     default: throw new TypeError('bleh')
//   }
// })

// { // Test cases for event handling
//   const test = new Element(document.querySelector('.test'))

//   test.remove()

//   console.log(test);
//   // const con = new AbortController
//   // const l = test.on('click', evt => {
//   //   console.log('ABORTING')
//   //   // con.abort()
//   // }, { signal: con.signal })
  
//   // con.abort()

//   // console.log(l);

//   // console.log(test);

//   // const handler = evt => {
//   //   console.log('stored handler')
//   //   test.off('click', handler)
//   // }

//   // test.on('click', evt => {
//   //   console.log('FIRST HANDLER')
//   // })

//   // test.on('click', handler)

//   // const listener = test.on('click', evt => {
//   //   console.log('SECOND HANDLER')
//   //   test.off(listener.id)
//   //   console.log('TEST');
//   //   // test.off('click')
//   // })
// }

// console.log(test.addEventListener('click', console.log, {
//   signal: new AbortController().signal
// }));

// test.classList.add('tessst', 'heyyyy')
// test.classList = new Map([['test', 'hey']])

// console.log(test.classList);



// import Bus from './bus/Bus.js'

// console.log(NGN)

// NGN.BUS.on('test', function (t1, t2) {
//   console.log(t1, t2)
//   console.log(this);
// })

// NGN.BUS.emit('test', 'hey')

// Bus.on({
//   test () {
//     console.log('WORKS')
//   }
// })

// Bus.emit('test')