REFACTOR ContentBinding to support arrays. Having them separate forces bindings to always return the same type, which creates bad DX.

Remove dummy elements from Attribute bindings and use Sets instead. Don't worry about
class order.



WORKER thread, generates tasks and fires messages when they are ready

MAIN thread, maintains a queue and adds task into it when messages fire.
IF queue contains tasks, run them

A generator could be used for this.

WORKER thread could send a task, triggering generator to run.

After each task, it will check the queue for new ones. 
If they exist, it will run them.
If there are none, it will go idle, waiting for the signal to run again.

Once the WORKER thread sends the "FINISHED" message, the generator will stop.

^ This may not even be necessary. The JS stack should handle this. Jet should
just listen for messages from the WORKER, and when it fires the "DONE" message,
it stops listening. It only needs to listen on render or reconcile events.

---

Consider ways of making views optionally asynchronous, so that they render independenty of the rest of the app.

```js
  html`<div class="my_view></div>`.attachView(MyView, { async: true })
```

<div class="my_view"></div> would be inserted into the DOM, but it's contents would be rendered asynchronously.

---

Consider adding a "priority" attribute to attachView.

```js
  html`<div class="my_view></div>`.attachView(MyView, {
    priority: 1 /* -1 - Infinity */
  })
```

Priority determines the order in which views of a parent view should be rendered to the screen. Default is source order, so if you want something further down the page to render before something earlier, this attribute could be used.

"async" property will override this if both are present.

```js
  html`<div class="my_view></div>`.attachView(MyView, {
    group: 'group_name',
    threshold: ''
  })
```

```js
  html`<div class="my_view></div>`.attachView(MyView, {
    fallback: {
      render () {
        return html`FALLBACK`
      }
    }
  })
```