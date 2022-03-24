import { App, html, track } from './index.js'

const View1 = {
  name: 'view.1',

  get template () {
    return html`
      <h2>View 1</h2>
      <p>lorem ipsum</p>
    `.on('click', console.log)
  },

  on: {
    unmount () {
      console.log('UNMOUNTING VIEW 1')
    },

    test (thing) {
      console.log(this.event)
      console.log(thing)
    }
  }
}

const View2 = {
  name: 'view.2',

  get template () {
    return html`
      <h2>View 2</h2>
      <p>lorem ipsum</p>
    `
  },

  on: {
    mount () {
      console.log('MOUNTING VIEW 2')
    }
  }
}

const data = {
  view: View1,
  str: 'hey'
}

const arr = [1,2,3]

// return html`${arr.map(num => html`<div>${num}</div>`)}`
const Demo = {
  name: 'root',

  get template () {
    return html`<div></div>`.attr({
      class: ['hello', track(data, 'str'), {
        test: track(data, 'str', str => str === 'hey')
      }]
    })
  },

  on: {
    mount () {
      setTimeout(() => {
        // console.log('FIRING');
        // this.emit('view.1.test', 'test')
        // this.emit('test.hey')
        data.str = 'blah'
        // console.log(data)
      }, 1500)
    }
  }
}

// ${html`<div></div>`.attr({
//   hidden: track(data, 'str', str => str === 'hey')
// })}

// ${track(data, 'str')}

// ${html`<div>CLICK ME</div>`.on({
//   click: console.log
// })}

// ${html`<div></div>`.bind(Test)}

const MyApp = new App('body', Demo, {
  name: 'My App',
  version: '0.0.1'
})

// const data = {
//   test: 42,
//   hey: false,
//   content: 'HEYYYY'
// }

// const Demo = new App({
//   name: 'Demo',
//   version: '0.0.1',
//   // contributors: []
//   root: 'body',
  
//   config: {
//     name: 'demo',

//     get style () {
//       return css`
//         .test {
//           background: red;
//         }
//       `
//     },

//     get template () {
//       return html`
//         ${track(data, 'content')}

//         ${html`<div>Embedded</div>`.bind({
//           attributes: {
//             test: track(data, 'test'),
//             hey: track(data, 'hey')
//           },

//           on: {
//             click: console.log
//           }
//         })}
//       `.bind({
//         attributes: {
//           test: false
//         }
//       })
//     },

//     init () {
//       setTimeout(() => {
//         data.test = 'heyyyy'
//         data.hey = true
//         data.content = 'HELOOOOO'
//       }, 1500)
//     }
//   }
// })