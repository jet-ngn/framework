#!/usr/bin/env node

import Builder from './build/index.js'
import { Shell } from '@author.io/shell'
import path from 'path'

const shell = new Shell({
  name: 'jet-dev',
  description: 'Jet development environment CLI',
  version: '0.0.1',

  commands: [
    {
      name: 'build',
      description: 'Build Jet UI Library distributable package.',
      
      flags: {
        dev: {
          type: 'boolean',
          description: 'Run a development build. This will prevent minification.'
        },

        watch: {
          type: 'boolean',
          description: 'Watch the source directory and rebuild when changes are made.'
        }
      },

      handler ({ flag, input }) {
        const { source, output, version, homepage, description, bugsURL } = Builder.project
        const dev = flag('dev')

        Builder.addTask('Cleaning output directory', next => {
          Builder.clean()
          next()
        })

        Builder.addTask('Creating bundle', async (next) => {
          await Builder.bundle({
            entryPoints: [path.join(source, 'index.js')],
            outfile: path.join(output, 'index.js'),
            minify: !dev,
            sourcemap: true,
            bundle: true,
            external: [
              'os',
              '@ngnjs/libnet-node',
              '@ngnjs/crypto',
              '@ngnjs/net',
              'crypto',
              'http',
              'https'
            ],
            target: ['es2020'],
            format: 'esm',

            aliases: [{
            //   filter: /^NGN/,
            //   filepath: path.join(source, 'node_modules', 'ngn', 'index.js')
            // }, {
              filter: /^NGN\/libdata/,
              filepath: path.join(source, 'node_modules', '@ngnjs', 'libdata', 'index.js')
            }],

            banner: {
              js: `/**
 * Jet v${version}
 * ${description}
 * Copyright ${new Date().getFullYear()} Ecor Ventures, LLC
 * Documentation: ${homepage}
 * Submit bug reports to: ${bugsURL}
 **/`
            }
          })

          next()
        })

        Builder.addTask('Copy index.html', async (next) => {
          await Builder.project.copyFile('index.html')
          next()
        })

        if (flag('watch')) {
          Builder.once('complete', () => {
            if (flag('watch')) {
              return Builder.watch(file => shell.exec(`build${input === '' ? '' : ` ${input}`}`))
            }
          })
        }

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