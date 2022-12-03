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


Data Modelling:

source: new Data.state({
    attributes: Object,
    create_date: Date,
    description: String,
    estimated_record_count: Number,
    estimated_size: Number,
    href: URL,
    id: String,
    type: String,
    title: String,
    
    name: {
      type: Object,
      
      keys: {
        physical: String,
        logical: String
      }   
    },

    queries: {
      type: Array,

      children: {
        type: Object,

        keys: {
          id: String,
          name: String,
          description: String,
          href: URL
        }
      }
    },

    sets: {
      type: Array,

      children: {
        type: Object,

        keys: {
          id: String,
          item_count: Number,
          description: String,
          estimated_size: Number,
          update_schedule: Number,
          last_update_date: Date,
          estimated_record_count: Number,
          href: URL,
          title: String
        }
      }
    },

    tags: {
      type: Array,
      children: String
    },
    
    aliases: {
      type: Object,

      keys: {
        Finance: String,
        Marketing: String
      }
    }
  })