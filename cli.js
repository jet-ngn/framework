#!/usr/bin/env node

import Builder from './build/index.js'
import { Shell } from '@author.io/shell'
import path from 'path'
import { log } from 'console'

const shell = new Shell({
  name: 'jet-dev',
  description: 'Jet development environment CLI',
  version: '0.0.1',

  commands: [
    {
      name: 'build',
      description: 'Build Jet UI Library distributable package.',
      
      flags: {
        watch: {
          type: 'boolean',
          description: 'Watch and rebuild when changes are made.'
        }
      },

      async handler ({ flag, input }) {
        const { source, output, version } = Builder.project

        Builder.addTask('Cleaning output directory', next => {
          Builder.clean()
          next()
        })

        Builder.addTask('Creating bundle', async (next) => {
          await Builder.bundle({
            entryPoints: [path.join(source, 'index.js')],
            outfile: path.join(output, 'index.js'),
            minify: true,
            keepNames: true,
            bundle: true,
            external: ['os'],
            sourcemap: true,
            target: ['es2020'],
            format: 'esm',

            banner: {
              js: `/**
 * Jet UI Framework v${version}
 * Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
 * Documentation: https://docs.jetui.com
 **/`
            },

            plugins: [{
              name: 'path-aliases',
              
              setup (build) {
                build.onResolve({ filter: /^NGN/ }, args => ({
                  path: path.join(source, 'node_modules', 'ngn', 'index.js')
                }))

                // build.onResolve({ filter: /^NET/ }, args => ({
                //   path: path.join(source, 'node_modules', '@ngnjs', 'net', 'index.js')
                // }))

                // build.onResolve({ filter: /^@ngnjs\/crypto/ }, args => ({
                //   path: path.join(source, 'node_modules', '@ngnjs', 'crypto', 'index.js')
                // }))
              },
            }]
          })

          next()
        })

        Builder.addTask('Copy index.html', async (next) => {
          await Builder.project.copyFile('index.html')
          next()
        })

        Builder.once('complete', () => {
          if (flag('watch')) {
            Builder.watch(file => shell.exec(`build${input === '' ? '' : ` ${input}`}`))
          }
        })

        Builder.run()
      },

      commands: [{
        name: 'examples',

        handler () {
          console.log('Build Examples')
        },
      }]
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