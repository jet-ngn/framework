## Guides

### Rendering DOM Elements

You can also use a ternary operation to output different content depending on the value of a boolean or an expression:

```js
const items = ['Item 1', 'Item 2', 'Item 3']
const { length } = items

this.render(html`
  ${length === 0
    ? html`No Items`
    : html`${length} Item${length > 1 ? 's' : ''}
  `}
`)
```