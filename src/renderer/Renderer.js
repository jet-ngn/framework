import { ROUTES } from '../env'

export function reconcile ({ patch, vars }) {
  console.log(ROUTES);
  console.log(patch);

  for (const { action, view } of patch) {
    console.log(`${action} ${view}`)
  }
}