let routes

function start (unsorted) {
  routes = new Map(unsorted.sort((a, b) => getValue(a[0]) >= getValue(b[0]) ? -1 : 1))
  console.log('match current route', routes)
  postMessage({
    action: 'init'
  })
}

function getValue (slugs) {
  return slugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
}

onmessage = ({ data }) => {
  switch (data.action) {
    case 'init': return start(data.payload)
    default: return console.log('HANDLE DEFAULT')
  }
}