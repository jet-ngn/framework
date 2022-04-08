import { App, html, track, Trackable } from './index.js'

const Test1 = {
  name: 'Test 1',
  scope: 'test1',

  get template () {
    return html`Test 1`
  }
}

const Test2 = {
  name: 'Test 2',
  scope: 'test2',

  get template () {
    return html`Test 2`
  }
}

const state = new Trackable({
  view: Test1
})

const TestApp = new App(document.body, {
  name: 'Test App',
  version: '0.0.1-alpha.1',
  scope: 'test',

  on: {
    mount () {
      setTimeout(() => state.view = Test2, 1500)
    }
  },

  get template () {
    return html`<div></div>`.bind(track(state, 'view'), {
      mount () {
        console.log('MOUNT', this)
      },

      unmount () {
        console.log('UNMOUNT', this)
      }
    })
  }
})