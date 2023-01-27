self.onmessage = ({ data }) => {
  // console.log(data)
  switch (data.action) {
    case 'init': return postMessage({
      action: 'init'
    })
  
    default: console.log('TODO: HANDLE DEFAULT DATA ACTION')
  }
}