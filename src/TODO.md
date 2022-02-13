Observables

```
let count = new Observable(0)
```

Observable takes primitives, objects, arrays, DataModels or DataStores.

See https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript
for a way of observing primitives.

Observable will add primitives to a global ObservableRegistry in which a substitute value will be created using Object.defineProperty. This will add a getter which will return the primitive value, and a setter which will fire events when set. The substitute value will be returned by `Observable` constructor. `count` will act as a reference to that value.

------

Consider adding `init` and `render` methods to Entity config:

```
const MyEntity = {
  name: 'my-entity',

  init () {
    this.render('My Entity')
  },

  render (title) {
    return html`
      <h1>${title}</h1>

      ${this.observe(this.state, state => html`
        ${state === 'idle' && html`
          <p>This entity is in the "${state}" state.</p>
        `}

        ${state === 'other' && html`
          <p>This entity is in the "${state}" state.</p>
        `}
      `)}
    `
  }
}
```

`init` runs immediately when entity is initialized, and render is only run when it is called. Under the hood, it calls `render` on `this.#root`.


Marketing ideas
----------------
Composable UI.
No overhead.
60fps.

Article ideas
----------------
How Jet uses composition and inheritance.
Event-based UI


- Array interp. diffing:

Instead of diffing DOM, diff the arrays themselves, and generate a list of instructions for updating the DOM.

- Consider a proxy for web components. This would wrap a predefined WC with jet-specific functionality.

- Observable

Make a function that wraps any object or class in a proxy. This will allow its properties to be bound.

Then, create a "ObservableInterpolation" that can be placed anywhere in the tree, and will re-render it's contents when the observed property changes.

```js
this.render(html`
  ${this.observe(observable, (...props) => html`...`)}
`)
```

- classNames feature doesn't support null, undefined, or empty string values

This feature should be abstracted into a utility function. It is useful other places besides just in the bind function. Maybe make a `makeClassList` utility function.

- Renderer and Reconciler should be completely separate from JetNodes. Rather than:

```js
element.render(html`...`)

element.reconcile(update)
```

it should be:

```js
Renderer.render(target, html`...`)

Reconciler.reconcile(element, update)
```

JetNode --> Jet<Element|Text|Comment>Node --> JetReference

This way references can apply to any type of node.