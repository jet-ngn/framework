import { App, html, createTrackable, track } from './index.js'

const user = createTrackable({
  name: 'Graham',
  age: 37,
  arr: [1,2,3,4],
  bool: true
})

// const arr = createTrackable([1,2,3])

const app = new App(document.body, {
  name: 'My App',
  version: '0.0.1',
  scope: 'root',

  get template () {
    return html`<pre>${track(user, 'bool', bool => bool && JSON.stringify(user, null, 2))}</pre>`
  },

  // on: {
  //   mount () {
  //     setTimeout(() => {
  //       arr.push(4)
  //       // user.name = 'Corey'
  //       // user.age = 40
  //     }, 1500)
  //   }
  // }
})

// return html`
    //   <div>${track(data, 'arr')}</div>
    // `.attr({
    //   class: track(data, 'name')

    //   // test: track(data, 'bool'),

    //   // class: [{
    //   //   hello: track(data, 'bool')
    //   // }, track(data, 'name'), 'hey']
    // })

// const View1 = {
//   name: 'view.1',

//   get template () {
//     return html`
//       <h2>View 1</h2>
//       <p>lorem ipsum</p>
//       ${html`<div></div>`.bind(Kid)}
//     `.on('click', console.log)
//   },

//   on: {
//     unmount () {
//       console.log('UNMOUNTING VIEW 1')
//     },

//     test (thing) {
//       console.log(this.event)
//       console.log(thing)
//     }
//   }
// }

// const Kid = {
//   name: 'kid',

//   get template () {
//     return html`<div>KID</div>`
//   },

//   on: {
//     unmount () {
//       console.log('UNMOUNTING KID')
//     }
//   }
// }

// const View2 = {
//   name: 'view.2',

//   get template () {
//     return html`
//       <h2>View 2</h2>
//       <p>lorem ipsum</p>
//     `
//   },

//   on: {
//     mount () {
//       console.log('MOUNTING VIEW 2')
//     }
//   }
// }

// const dataFrom = {
//   view: View1,
//   str: 'hey',
//   arr: [1,2,3],
//   bool: true
// }

// return html`${arr.map(num => html`<div>${num}</div>`)}`

// ${track(data, 'str', str => str === 'hey' ? html`HEY` : html`NOT HEY`)}


// ${html`<div></div>`.attr({
//   hidden: track(data, 'str', str => str === 'hey')
// })}

// ${track(data, 'str')}

// ${html`<div>CLICK ME</div>`.on({
//   click: console.log
// })}

// ${html`<div></div>`.bind(Test)}

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