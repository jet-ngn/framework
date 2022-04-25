import CommonMapping from '../CommonMapping.js'

export default {
  name: 'QWERTY',

  map: Object.values(CommonMapping).reduce((mapping, key) => {
    mapping[key] = key
    return mapping
  }, {})
}
