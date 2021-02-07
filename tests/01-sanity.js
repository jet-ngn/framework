import test from 'tappedout'
import NGN from 'ngn'
import { Component, Entity, Partial, html, css, markdown } from 'jet'

test('start', t => {
  t.ok(true, 'Tests work.')

  ;[
    Component,
    Entity,
    Partial
  ].forEach(func => t.expect('function', typeof func, `${func.name} exists`))

  ;[
    html,
    css,
    markdown
  ].forEach(tag => t.expect('function', typeof tag, `${tag.name} tag exists`))

  // ADD MORE TESTS HERE

  t.end()
})

// ADD MORE TESTS HERE,
// or create additional files in the ../tests directory.
// Any files added to that directory will automatically be run.
// Filenames should be prefixed with a number, ie 02-mytests.js
