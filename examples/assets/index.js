import { Bus, Entity, Assets, html } from '../../src/index.js'

const Demo = new Entity({
  selector: 'body',
  name: 'loader',

  on: {
    initialize () {
      this.render(html`
        ${Assets.get('Test')}
        ${Assets.get('Test')}
      `)
    }
  }
})

Bus.on('ready', async () => {
  await Assets.load([{
    name: 'Test',
    path: './test.html'
  }, {
    name: 'Test 2',
    path: './test2.html'
  }])

  Demo.initialize()
})
