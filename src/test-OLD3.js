import { App, svg, html, track, Trackable, getChanges } from './index.js'

// const View1 = {
//   name: 'View 1',
//   scope: 'view1',

//   get template () {
//     return html`VIEW 1`
//   }
// }

// const View2 = {
//   name: 'View 2',
//   scope: 'view2',

//   get template () {
//     return html`VIEW 2`
//   }
// }

const state = new Trackable({
  // view: View1,
  bool: true,
  cls: 'classname'
})

const rows = new Trackable([1,2,3])

const TestApp = new App(document.body, {
  name: 'Test App',
  version: '0.0.1-alpha.1',
  scope: 'root',

  on: {
    mount () {
      setTimeout(() => {
        rows.shift()
        // rows.push(4)

        // setTimeout(() => {
        //   rows.reverse()
        //   console.log(getChanges(rows));
        // }, 1500)
      }, 1500)
    }
  },

  get template () {
    return html`
      <div>
        ${track(rows, rows => rows.map(item => html`
          <div>
            ${item}
            <p>lorem ipsum</p>
          </div>
        `))}
      </div>
    `

    // return html`
    //   ${track(rows, rows => rows.map(row => html`<div>${row}</div>`))}
    // `

    // return html`
    //   ${html`
    //     <button>
    //       ${track(state, 'bool', bool => Icon(bool ? 'pause' : 'play'))}
    //     </button>
    //   `.on('click', evt => state.bool = !state.bool)}
    // `
    // return html`${track(state, 'bool', bool => bool ? html`TRUE` : html`FALSE`)}`

    // return html`<section></section>`.bind(track(state, 'view')).attr({
    //   class: [track(state, 'view', ({ scope }) => scope), 'test']
    // })

    // return html`
    //   ${state.arr.map(item => html`<section class="${item}">${item}</section>`)}
    // `
    // return html`<main></main>`.bind(track(state, 'view')).attr({
    //   class: [{
    //     test: track(state, 'bool')
    //   }, track(state, 'bool', bool => bool ? 'yep' : 'nope')]
    // })
  },

  // on: {
  //   mount () {
  //     setTimeout(() => {
  //       // state.view = View2
  //       state.bool = false

  //       setTimeout(() => {
  //         state.bool = true
  //         // state.view = View1
  //       }, 1500)
  //     }, 1500)
  //   }
  // }
})

// const user = createTrackable({
//   name: 'Graham',
//   age: 37,
//   arr: [1,2],
//   bool: false,
  
//   obj: {
//     hi: 'hey',
//     yo: 'hi there',
//     sup: 'yo'
//   },

//   zul: null
// })

// const Test1 = {
//   name: 'Test Entity 1',
//   scope: 'test1 ',

//   get template () {
//     return html`TEST 1`
//   },

//   // on: {
//   //   mount () {
//   //     console.log('MOUNT TEST 1', this)
//   //   }
//   // }
// }

// const Test2 = {
//   name: 'Test Entity 2',
//   scope: 'test2',

//   get template () {
//     return html`TEST 2`
//   },

//   // on: {
//   //   mount () {
//   //     console.log('MOUNT TEST 2', this)
//   //   }
//   // }
// }

// function make (number) {
//   return {
//     name: `Item ${number}`,
//     scope: `item.${number}`,

//     get template () {
//       return html`ENTITY ${number}`
//     },

//     // on: {
//     //   mount () {
//     //     console.log('MOUNTING ', number, this)
//     //   },

//     //   unmount () {
//     //     console.log('UNMOUNTING', number)
//     //   }
//     // }
//   }
// }

// const state = createTrackable({
//   view: Test1
// })

// const app = new App(document.body, {
//   name: 'My App',
//   version: '0.0.1',
//   scope: 'root',

//   get template () {
//     return html`<div></div>`.bind(track(state, 'view'))
//     // return html`${user.arr.map(item => html`<div></div>`.bind(make(item)))}`
//     // return html`${track(user, 'arr', arr => arr.map(item => html`<div></div>`.bind(make(item))))}`
//   },

//   on: {
//     mount () {
//       // console.log('MOUNT ROOT', this)

//       setTimeout(() => {
//         state.view = Test2
//         user.arr.push(3)

//         setTimeout(() => {
//           state.view = Test1
//         }, 1500)
//       }, 1500)
//     }
//   }
// })