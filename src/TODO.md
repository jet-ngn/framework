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