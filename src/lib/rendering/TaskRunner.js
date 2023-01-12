export function runTasks (tasks, { callback, restart = null } = {}) {
  const { value, done } = tasks.next()

  if (done) {
    return callback && callback()
  }

  const [name, handler] = value
  console.log(name)
  handler({
    next: () => runTasks(...arguments),
    restart
  })
}