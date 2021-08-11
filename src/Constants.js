export default {
  INTERPOLATION_ARRAY: Symbol('array'),
  INTERPOLATION_BATCH: Symbol('batch'),
  INTERPOLATION_BINDING: Symbol('bind'),
  INTERPOLATION_DATABINDING: Symbol('databind'),
  INTERPOLATION_FETCH: Symbol('fetch'),
  INTERPOLATION_PARTIAL: Symbol('partial'),
  INTERPOLATION_PLACEHOLDER: Symbol('placeholder'),
  INTERPOLATION_TAG: Symbol('tag'),
  INTERPOLATION_TEXT: Symbol('text'),

  DATA_RESERVEDNAMES: ['bind', 'tojson', 'add', 'attach'],
  REF_RESERVEDNAMES: ['add', 'remove', 'root']
}