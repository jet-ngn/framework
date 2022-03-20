import { App, html, track } from './index.js'

const View1 = {
  name: 'view.1',

  get template () {
    return html`
      <h2>View 1</h2>
      <p>lorem ipsum</p>
    `
  },

  on: {
    unmount () {
      console.log('UNMOUNTING VIEW 1')
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

const Demo = {
  name: 'root',

  get template () {
    return html`
      <h1>My App</h1>
      ${html`<div class="view"></div>`.bind(track(data, 'view'))}
    `
  },

  on: {
    mount () {
      setTimeout(() => data.view = View2, 1500)
    }
  }
}

// ${track(data, 'str')}

// ${html`<div>CLICK ME</div>`.on({
//   click: console.log
// })}

// ${html`<div></div>`.bind(Test)}

const MyApp = new App({
  name: 'My App',
  version: '0.0.1',
  root: 'body',
  config: Demo
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