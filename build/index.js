import ProductionLine from './productionline/index.js'

const Builder = new ProductionLine({
  name: 'jet-build',
  description: 'Build tool to produce Jet UI Library distribution package',
  version: '0.0.1'
})

export { Builder as default }