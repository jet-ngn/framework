Store two types of references:

- `SelectorReference`
- `ElementReference`

`ReferenceManager.references` should query for each `SelectorReference` and return a  `ReferenceElement` for each. Then, it should generate `Reference`s for all `ElementReferences`.

`Reference`s are proxies to `Element`s

This strategy shoudl cut down on the logic necessary in the `ReferenceManager`



Using the NGN LEDGER
const JET_BUS = new EventEmitter

NGN.LEDGER.createEventType('JET_EVENT', 'fireJetEvent')

NGN.LEDGER.on(NGN.JET_EVENT, function () {})

NGN.fireJetEvent('ui.element.remove')