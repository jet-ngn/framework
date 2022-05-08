export function handleError ({ cause, help }) {
  console.error(arguments[0])

  if (cause) {
    console.warn(`Cause: ${cause}`)
  }

  if (help) {
    console.info(help)
  }
  
  // console.log('Stack Trace:')
  // error.trace.forEach(({ path, line, column }) => {
  //   console.log(`${path}:${line}:${column}`)
  // })
}