#!/usr/bin/env node

import path from 'path'
import { Shell } from '@author.io/shell'
import ProductionLine, { bundleJs } from 'productionline'

const Builder = new ProductionLine({
  name: 'jet-build',
  description: 'Build tool to produce Jet UI Library distribution packages',
  version: '0.0.1-alpha.1'
})

const shell = new Shell({
  name: 'jet',
  description: 'CLI for testing and creating Jet distributable packages',
  version: '0.0.1',

  commands: [
    {
      name: 'build',
      description: 'Generate Jet UI Library distributable packages.',

      async handler ({ flag, input }) {
        const { source, output } = Builder
        const { version, homepage, bugsURL } = Builder.project

        const config = {
          entry: [path.join(source, `index.js`)],

          external: [
            'os',
            '@ngnjs/libnet-node',
            '@ngnjs/crypto',
            '@ngnjs/net',
            'ngn-data',
            'crypto',
            'http',
            'https',
          ],

          aliases: [{
            filter: /^history/,
            path: path.join(source, 'node_modules', 'history', 'browser.js')
          }, {
            filter: /^IAM/,
            path: path.join(source, 'node_modules', '@author.io', 'iam', 'index.js')
          }{
            filter: /^nanoid/,
            path: path.join(source, 'node_modules', 'nanoid', 'index.js')
          }, ]
        }

        Builder.addTask('Cleaning output directory', async () => await Builder.clean())

        Builder.addTask('Creating development bundle', async () => {
          await bundleJs({
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

        Builder.addTask('Creating production bundle', async () => {
          await bundleJs({
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

        await Builder.run()
      }
    },

    {
      name: 'test',

      handler () {
        console.log('RUN TEST SUITE')
      }
    }
  ]
})

shell.exec(process.argv.slice(2).join(' '))