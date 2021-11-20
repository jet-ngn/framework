Add ':scope >' before all reference selectors 





- When binding to a reference, maybe check if it has child elements, and if so, generate vdom from them. This will allow hooking pre-rendered html into the renderer.



//     // TODO:

//     // in Component, add a property "closed"
//     // When true, the WC will not be affected by re-renders. Defaults to false
//     // Add "update" event to open components which will fire each time the component is affected by a re-render

//     // Also consider an "exempt" function to prevent an html node from being affected by re-renders
//     //
//     // this.render(html`
//     //   <div>This div will update ${someValue} on re-renders</div>

//     //   ${this.exempt(html`
//     //     <div>This div will only render ${someValue} on the first pass</div>
//     //   `)}
//     // `)
//     // 
//     // Consider making this possible for attributes as well


- All element nodes should be references.   ReferenceElement should be the core accessor for any DOM elements, text and comment nodes included.

- In addition, rendering should support all dom methods on Elements, like `insertAdjacentHTML`. The Reference class should be a total replacement for working with DOM directly, and while the API is the same (with additions), the behavior is altered by Jet.

For example, calling insertAdjacentHTML should generate new References for each element inserted and insert them into the template as well.

Each Reference has a template attached to it which can be altered, triggering re-renders.

This will emulate the behavior of a native dom reconciler.



- Add "update()" method to Partials. This will re-render the partial in place.
