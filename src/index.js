import NGN from 'NGN'
import Element from './Element.js'

// NGN.LEDGER.on('*', function (evt, handler, id) {
//   console.log(evt);
//   // console.log(t1)
//   // console.log(t2)
//   // console.log(t3)
// })

{ // Test cases for event handling
  const test = new Element(document.querySelector('.test'))
  // const con = new AbortController
  // const l = test.on('click', evt => {
  //   console.log('ABORTING')
  //   // con.abort()
  // }, { signal: con.signal })
  
  // con.abort()

  // console.log(l);


  const handler = evt => {
    console.log('stored handler')
  }

  test.on('click', evt => {
    console.log('FIRST HANDLER')
  })

  test.on('click', handler)

  const listener = test.on('click', evt => {
    console.log('SECOND HANDLER')
    test.off('click')
    // test.off('click', handler)
    // test.off(listener.id)
  })
}

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