export async function runTasks (tasks, { callback, restart = null } = {}) {
  const { value, done } = tasks.next()

  if (done) {
    return callback && callback()
  }

  const [name, handler] = value
  // console.log(name);
  await handler({
    next: () => runTasks(...arguments),
    restart
  })
}