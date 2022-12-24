import View from "../../View"

const views = new Map

export function getView (rootNode, config) {
  console.log(rootNode);
  const view = views.get(rootNode)
  console.log(views);
  console.log(view);
  return view?.config === config ? view : null
}

export function registerView (parent, rootNode, config, route) {
  const view = new View(...arguments)
  views.set(rootNode, view)
  return view
}