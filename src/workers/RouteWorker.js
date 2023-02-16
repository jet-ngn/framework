// let ROUTES
// let LINEAGE = []

// function init ({ initialRoute, routes } = {}) {
//   // console.log(routes);
//   // ROUTES = new Map(routes.sort((a, b) => {
//   //   return getValue(a[0]) >= getValue(b[0]) ? -1 : 1
//   // }).map(([slugs, lineage]) => [typeof slugs === 'number' ? slugs : `/${slugs.join('/')}`, lineage]))
//   // console.log(ROUTES);
//   // reconcile(initialRoute, true)

//   postMessage({
//     action: 'init'
//   })
// }

// function getMatch (slugs) {
//   console.log(ROUTES)
//   console.log(slugs);

  
//   // let match, remaining = [...slugs]

//   // for (const [routeSlugs, lineage] of ROUTES.entries()) {
//   //   if (routeSlugs.length !== length) {
//   //     continue
//   //   }

//   //   if (routeSlugs.join('/') === path) {
//   //     return { lineage, vars: null }
//   //   }

//   //   vars = {}
    
//   //   const matches = routeSlugs.every((slug, i) => {
//   //     if (slug.startsWith(':')) {
//   //       vars[slug.replace(':', '')] = slugs[i]
//   //       return true
//   //     }

//   //     return slug === slugs[i]
//   //   })

//   //   if (matches) {
//   //     return { lineage, vars }
//   //   }


//   // }

//   return null
// }

// function getPatch (lineage) {
//   const { length } = LINEAGE

//   if (length === 0) {
//     return lineage.map(id => ({
//       action: 'render',
//       view: id
//     }))
//   }

//   const patch = []

//   for (const [index, id] of LINEAGE.entries()) {
//     const update = lineage[index]

//     if (update === id) {
//       continue
//     }

//     patch.unshift({
//       action: 'disconnect',
//       view: id
//     })

//     update && patch.push({
//       action: 'render',
//       view: id
//     })
//   }

//   return patch
// }

// function getValue (slugs) {
//   if (typeof slugs === 'number') {
//     return -1
//   }

//   return slugs.reduce((result, slug) => result += slug.startsWith(':') ? 1 : 2, 0)
// }

// function reconcile (route, init = false) {
//   const matched = getMatch(route)

//   postMessage({
//     action: init ? 'init' : 'patch',
//     vars: matched?.vars ?? null,
//     patch: getPatch(matched?.lineage ?? []) // TODO: 404
//   })
// }

const subscribers = {}

function match ({ path, routes }) {
  // const slugs = 
  postMessage({
    action: 'matched',
    lineage: []
  })
}

function registerSubscriber ({ id, routes, baseURL }) {
  subscribers[id] = { routes, baseURL }

  postMessage({
    action: 'registered'
  })
}

onmessage = ({ data }) => {
  const { action, payload } = data

  switch (action) {
    case 'register': return registerSubscriber(payload)
    case 'match': return match(payload)
  }
}