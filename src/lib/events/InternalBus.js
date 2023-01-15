import Bus from './Bus'
import { INTERNAL_ACCESS_KEY } from '../../env'

export default class InternalBus extends Bus {}

export async function emitInternal (view, evt, ...args) {
  await view.emit(INTERNAL_ACCESS_KEY, evt, ...args)
}