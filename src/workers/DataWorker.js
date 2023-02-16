function registerSubscriber ({ id, data }) {
  // console.log(...arguments)

  postMessage({
    action: 'registered'
  })
}

onmessage = ({ data }) => {
  switch (data.action) {
    case 'register': return registerSubscriber(data.payload)
  }
}