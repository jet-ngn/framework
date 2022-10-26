- Support "undefined" values in binding transform functions

- Add a default maximum number of retries after aborting to prevent call stack overflow
  - Make sure to reset the number of tries if retry is successful

- Customize 401, 403, and 404 templates:

```js
routes: {
  403: {...},
  404: {...},
  '/test': {...}
}
```

- Custom Templates
  - Pass in through `createApp` config (or any view)

- Add data and route change events