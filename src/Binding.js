import { BINDINGS } from './env'

export function bind (...props) {
  return new Binding(null, ...props)
}

export function bindEach (arr) {
  console.log('BIND EACH')
  // return new Binding
}

function Binding (ctx, ...props) {
  const states = new Map([['default', props]]),
        id = crypto.randomUUID()

  let transform = _ => _
  BINDINGS.set(id, { ctx, states, transform })

  return {
    type: 'bind',
    id,
    from: state => states.set(state, states.get('default')).delete('default'),
    to: fn => transform = fn,
    or: (...props) => new Binding(this, ...props)
  }
}