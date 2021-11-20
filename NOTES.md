# Event Bus

- change "ready" event to "DOMContentLoaded". There is no reason to obscure the native event names.
  Alternatively, encompass multiple events withint the "ready" event. Include "load" and possibly other
  events indicating Jet is initialized.


# State Machine

- To handle non-deterministic states, just add multiple state machines instead of
trying to manage them all with one.

```
states: [{
  collapsed: {
    on () {
      this.root.classList.add('collapsed')
    },

    off () {
      this.root.classList.remove('collapsed')
    }
  }
}, {
  view1 () {
    ...
  },

  view2 () {
    ...
  }
}],

on: {
  initialize () {
    this.states[1].set('view1')

    if (condition) {
      this.states[0].set('collapsed')
    }
  }
}
```

Use `this.states[n][.set][.transition]` etc syntax. This will be in keeping with the API of the rest of the framework, and it will be more powerful for a small tradeoff in verbosity.

If the `states` config is an object, just use `this.state[.set][.transition]`. This syntax is equivalent to `this.states[0][.set][.transition]`

# Possible names for what is now called "Entity"

- Agent (https://en.wikipedia.org/wiki/Software_agent)
- Daemon
- Driver
- Component

Maybe rename "Driver" to "DomainObject" and stick with "Entity."