- All element nodes should be references.   ReferenceElement should be the core accessor for any DOM elements, text and comment nodes included.

- In addition, rendering should support all dom methods on Elements, like `insertAdjacentHTML`. The Reference class should be a total replacement for working with DOM directly, and while the API is the same, the behavior is altered by Jet.

For example, calling insertAdjacentHTML should generate new References for each element inserted and insert them into the template as well.

Each Reference has a template attached to it which can be altered, triggering re-renders.

This will emulate the behavior of a native dom reconciler.
