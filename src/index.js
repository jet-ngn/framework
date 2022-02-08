import Entity from './Entity.js'
import JetCustomElement from './JetCustomElement.js'

const TestElement = new JetCustomElement({
  name: 'jet-test'
})

customElements.define('jet-test', TestElement)

const hello = new Entity({
  // name: 'hello',
  // selector: '.hello',

  states: {
    test () {
      console.log('YO');
    }
  }
})

const test = new Entity({
  // name: 'test',

  extends: [hello],

  states: {
    test () {
      console.log('wut');
    }
  }

  // extends: [
  //   hello,

  //   {
  //     name: 'hey',
  //     extends: [hello]
  //   }
  // ]
})

console.log(test);