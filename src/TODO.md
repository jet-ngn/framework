Get rid of "Entity" as a user-facing concept. Use "config" instead:

```
html`
  ${this.bind({
    config: Div
  }, html`<div></div>`)}
`
```




Array rendering

```
${this.track(this.data.items, items => html`
  ${items.map(item => html`
    <li>${item.name}</li>
  `)}
`)}
```

Arrays returned from the track callback have special properties on each item to determine whether the element should be visible or not.

For filtering, simply add the "hidden" attribute to all elements that are filtered out.

For sorting, add hidden to all elements, perform the sorting operation, then remove "hidden" from the ones that should be displayed.

If that doesn't work, implement a DOM-diffing algo for sorting.


Tracking

If using "var" it i possible to track global variables, because they will stored on the window object. So, you could do this:

```
var count = 0

const Ent = {
  render () {
    return html`
      ${this.track(window, 'count', count => html`
        <div>${count}</div>
      `)}
    `
  }
}
```


States

```
states: [{
  idle () {

  }
}]
```



Observables

```
let count = this.track(class, property[, property[, property]], cb)
```

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
Declarative, Composable UI.
60fps rendering with no Virtual DOM overhead.
No compilation or build step necessary.
No non-standard HTML syntax.

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