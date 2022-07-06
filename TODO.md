Keep track of all templates when views are rendered.

When a template is reused, don't recreate the entire thing, take the nodes in memory, clone them, update their contents, and render that.

```js
const arr = new Dataset([1,2,3])

const View = {
  get template () {
    return bind(arr, arr => map(arr, item => html`<li>${item}</li>`))
  }
}
```

* Creates a "mapping"
* Consider making this work for Maps and sets too

This will cache the template rendered on the initial pass and reuse it for all additional iterations.
When updates occur, it will be able to use the cached template instead of recreating it.

This should also get around the issue of having to check whether or not one of the data sources for a binding is an array- the map function will offload that logic.