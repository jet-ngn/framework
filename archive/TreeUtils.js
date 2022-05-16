export function generateTreeNode (type, target, route = null) {
  return {
    type,
    target,
    route,
    children: []
  }
}