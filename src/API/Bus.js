export default class Bus {
  static emit (evt, ...rest) {
    // Inject null as source of event
    NGN.BUS.emit(evt, null, ...rest)
  }

  static on () {
    NGN.BUS.on(...arguments)
  }

  static off () {
    NGN.BUS.off(...arguments)
  }

  static funnel () {
    NGN.BUS.funnel(...arguments)
  }
}