import { createApp } from 'jet'
import { State } from 'jet/data'

const arr = new State([1,2,3])
const obj = new State({ test: 'hello' })

function ListItem (item) {
  return html`<li></li>`.attachView(ListItem)
}

const List = {
  render () {
    return html`${bind(arr, arr => arr.map(ListItem))}`
  }
}

const TestView = {
  render () {
    return html`
      ${this.routes}
    `
  }
}

createApp({
  name: 'Jet',

  routes: {
    '/test': [TestView, {
      '/hello': HelloView,
      '/nested': [ViewWithNestedRoutes, {
        '/deeply': DeeplyNestedView
      }]
    }]
  },

  render () {
    return html`
      <h1>Test</h1>

      <!--
        Views are the only objects which can be injected into a template.
        They don't need to have a single element, it is just the template which gets returned.
        They store references to the nodes they control- When using the find() function, they use
        Element.matches() (see MDN for usage.)
      -->
      ${MyViewConfig}
      <!-- OR -->
      ${html`<div></div>`.attachView(MyViewConfig)}

      <!-- 
        Bindings can also return different views.
        "currentView" returns a ViewConfigObject
       -->
       ${bind(state, 'currentView')}

      ${html`<div></div>`.attachRoutes(this.routes)}
      <!-- OR -->
      ${this.routes}

      <!-- 
        attachView can also accept bindings.
       -->

      <!--
        Templates no longer accept arrays. To work with an array, use bindEach() function.
        This outputs a DataBindingInterpolation that creates a ContentBindingManager. This class
        will manage multiple ContentBindings, so ContentBinding doesn't have to worry about arrays.
        There will be a separate one for each element of the array. This should make them much easier
        to manage.
      -->

      <!-- ${bind(arr, ({ length }) => length === 0 && html`<p>No items.</p>`)} -->

      <!--
        States must be defined, but their children don't have to be defined explicitly, because there
        won't be any consts. So for:

        const state = new State({
          name: 'My State',

          child: {
            name: 'Child Object of My State'
          }
        })

        if you call bind(state.child, 'name'), the binding can be initialized in realtime. It should
        not be necessary to specify state.child as a State, as it can be replaced with a proxy the first
        time it is bound to.
      -->

      ${bind(arr, ({ length }) => length > 0 ? html`
        ${map(arr, item => html`<li>${bind(item, 'name')}</li>`)}
      ` : html`<p>No items.</p>`)}
    `
  }
})

function html () {
  return new TemplateConstructor('html', ...arguments)
}

function TemplateConfigurator (cfg) {
  switch (this.type) {
    case 'html': return new HTMLTemplate(cfg)
    case 'svg': return new SVGTemplate(cfg)
    case 'md': return new MarkdownTemplate(cfg)
    case 'css': return new CSSTemplate(cfg)
    default: throw new Error()
  }
}

function TemplateConstructor (type, strings, ...interpolations) {
  this.type = type
  return TemplateFactory.bind(this)
}

// Parser should check for TemplateFactories, and if they exist, call them, returning a fully-configured
// Template object. If it finds a Template object already configured, just use that.