#!/usr/bin/env node

// import fs from 'fs-extra'
import path from 'path'

export default [
  {
    name: 'build',
    description: 'Generate Jet UI Library distributable packages.',

    async handler ({ flag, input }) {
      const { source, output } = this
      const { version, homepage, bugsURL } = this.project

      const config = {
        entry: [path.join(source, `index.js`)],

        aliases: [{
          filter: /^history$/,
          path: path.join(source, 'node_modules', 'history', 'browser.js')
        }, {
          filter: /^nanoid$/,
          path: path.join(source, 'node_modules', 'nanoid', 'index.js')
        }]
      }

      this.addTask('Cleaning output directory', async () => {
        await this.clean()
      })

      this.addTask('Creating development bundle', async () => {
        await this.bundleJS({
          ...config,
          output: path.join(output, 'dev', `index.js`),
          minify: false,

          banner: `/**
* Jet Development Build v${version}
* Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
* Documentation: ${homepage}
* Submit bug reports to: ${bugsURL}
**/`
        })
      })

      this.addTask('Creating production bundle', async () => {
        await this.bundleJS({
          ...config,
          output: path.join(output, 'prod', `index.js`),
          minify: true,

          banner: `/**
* Jet Production Build v${version}
* Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
* Documentation: ${homepage}
* Submit bug reports to: ${bugsURL}
**/`
        })
      })

      await this.run()
    }
  }
]

// import path from 'path'
// import { Shell } from '@author.io/shell'
// import ProductionLine, { bundleJs } from 'productionline'

// const Builder = new ProductionLine({
//   name: 'jet-build',
//   description: 'Build tool to produce Jet UI Library distribution packages',
//   version: '0.0.1-alpha.1'
// })

// const shell = new Shell({
//   name: 'jet',
//   description: 'CLI for testing and creating Jet distributable packages',
//   version: '0.0.1',

//   commands: [
//     {
//       name: 'build',
//       description: 'Generate Jet UI Library distributable packages.',

//       async handler ({ flag, input }) {
//         const { source, output } = Builder
//         const { version, homepage, bugsURL } = Builder.project

//         const config = {
//           entry: [path.join(source, `index.js`)],

//           external: [
//             'crypto'
//           ],

//           aliases: [{
//             filter: /^history$/,
//             path: path.join(source, 'node_modules', 'history', 'browser.js')
//           }, {
//             filter: /^nanoid$/,
//             path: path.join(source, 'node_modules', 'nanoid', 'index.js')
//           }]
//         }

//         Builder.addTask('Cleaning output directory', async () => await Builder.clean())

//         Builder.addTask('Creating development bundle', async () => {
//           await bundleJs({
//             ...config,
//             output: path.join(output, 'dev', `index.js`),
//             minify: false,

//             banner: `/**
// * Jet Development Build v${version}
// * Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
// * Documentation: ${homepage}
// * Submit bug reports to: ${bugsURL}
// **/`
//           })
//         })

//         Builder.addTask('Creating production bundle', async () => {
//           await bundleJs({
//             ...config,
//             output: path.join(output, 'prod', `index.js`),
//             minify: true,

//             banner: `/**
// * Jet Production Build v${version}
// * Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
// * Documentation: ${homepage}
// * Submit bug reports to: ${bugsURL}
// **/`
//           })
//         })

//         await Builder.run()
//       },

//       commands: [{
//         name: 'components',
//         description: 'Build Jet standard library components',
        
//         handler () {
//           console.log('BUILD COMPONENTS')
//         }
//       }, {
//         name: 'plugins',
//         description: 'Build Jet standard library plugins',
        
//         handler () {
//           console.log('BUILD PLUGINS')
//         }
//       }]
//     },

//     {
//       name: 'test',

//       handler () {
//         console.log('RUN TEST SUITE')
//       }
//     }
//   ]
// })

// shell.exec(process.argv.slice(2).join(' '))