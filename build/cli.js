#!/usr/bin/env node

import path from 'path'
import ProductionLine from './productionline/index.js'
import ESBuild from 'esbuild'

const builder = new ProductionLine({
  name: 'jet-builder',
  description: 'Build tool for Jet UI Library',
  version: '0.0.1',
  root: '../',

  commands: [
    // {
    //   name: 'buildjs',

    //   handler ({ flag }, tasks) {
    //     tasks.add('Build JavaScript', next => {
    //       next()
    //     })
    //   }
    // },

    {
      name: 'build',
      description: 'Build Jet UI Library',

      flags: {
        dev: {
          type: 'boolean',
          description: 'Generate distributable package.'
        },

        watch: {
          type: 'boolean',
          description: 'Watch and rebuild when changes are made.'
        }
      },

      handler ({ flag }, tasks) {
        const dev = !!flag('dev')

        tasks.add('Cleaning output directory', next => {
          builder.clean()
          next()
        })

        tasks.add('Creating bundle', next => {
          const { source, output } = builder.project
          const dev = flag('dev')
          const watch = flag('watch')

          ESBuild.build({
            entryPoints: [path.join(source, 'index.js')],
            outfile: path.join(output, 'index.js'),
            minify: !dev,
            bundle: true,
            sourcemap: !dev,
            target: flag('target') ?? ['es2020'],
            keepNames: true,
            
            // external: !!flag('bundle') ? [
            //   'os',
            //   '@ngnjs/libnet-node',
            //   '@ngnjs/crypto',
            //   '@ngnjs/net',
            //   'crypto',
            //   'http',
            //   'https'
            // ] : [],

            // plugins: [{
            //   name: 'path-aliases',
              
            //   setup (build) {
            //     build.onResolve({ filter: /^jet/ }, args => ({
            //       path: path.join(source, 'lib', args.path, 'index.js')
            //     }))

            //     build.onResolve({ filter: /^firebase\// }, args => ({
            //       path: path.join(source, 'node_modules', args.path, 'dist', 'index.esm.js')
            //     }))

            //     build.onResolve({ filter: /^IAM/ }, args => ({
            //       path: path.join(source, 'node_modules', '@author.io', 'iam', 'index.js')
            //     }))

            //     build.onResolve({ filter: /^author-shell/ }, args => ({
            //       path: path.join(source, 'node_modules', '@author.io', 'shell', 'index.js')
            //     }))

            //     build.onResolve({ filter: /^NGN/ }, args => ({
            //       path: path.join(source, 'node_modules', 'ngn', 'index.js')
            //     }))

            //     build.onResolve({ filter: /^NET/ }, args => ({
            //       path: path.join(source, 'node_modules', '@ngnjs', 'net', 'index.js')
            //     }))

            //     build.onResolve({ filter: /^@ngnjs\/crypto/ }, args => ({
            //       path: path.join(source, 'node_modules', '@ngnjs', 'crypto', 'index.js')
            //     }))
            
            //     // Mark all paths starting with "http://" or "https://" as external
            //     build.onResolve({ filter: /^https?:\/\// }, args => {
            //       return { path: args.path, external: true }
            //     })
            //   },
            // }]
          }).then(({ warnings }) => {
            if (warnings.length > 0) {
              warnings.forEach(console.log)
            }

            next()
          }).catch(e => {
            console.error(e)
            process.exit(1)
          })
        })
      }
    },

    {
      name: 'examples',

      handler () {
        console.log('Show help')
      },

      commands: [
        {
          name: 'build',
  
          handler () {
            console.log('BUILD EXAMPLES')
          }
        },
      ]
    },

    {
      name: 'test',

      handler () {
        console.log('RUN TEST SUITE')
      }
    }
  ]
})

builder.run(process.argv)

