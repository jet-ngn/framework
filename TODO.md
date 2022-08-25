- Add data and route change events
- Allow this:

```js
const MyView = {
  data: {
    active: true,
    string: 'Hello'
  },

  get template () {
    return html`
      ${html`<button></button>`.setAttibute({
        disabled: bind(this.data, 'active')
      })}

      ${bind(this.data, 'string')}
    `
  }
}
```