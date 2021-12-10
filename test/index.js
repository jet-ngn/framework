import test from 'tappedout'

import Element from '../src/Element.js'

test('Sanity', t => {
  t.ok(true, 'Tests work.')

  t.expect('function', typeof Element, `Element exists`)
  t.end()
})

test('DOM Event Handling', t => {
  // const element = new Element(document.createElement)

  t.end()
})
