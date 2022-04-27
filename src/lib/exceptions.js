// import { defineException } from 'NGN'

// defineException({
//   name: 'BaseURLMismatchError',
//   type: 'BaseURLMismatchError',
//   severity: 'critical',
//   category: 'user',
//   message: 'URL entered does not match the App base URL',
// })

// defineException({
//   name: 'AppStartError',
//   type: 'AppStartError',
//   severity: 'critical',
//   category: 'programmer',
//   message: 'App has already started',
//   custom: {
//     cause: 'App "start" method was called more than once',
//     help: `If this is the first or only app created within your project, it will be started automatically by Jet, so you do not need to call its "start" method.`
//   }
// })