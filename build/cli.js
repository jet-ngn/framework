#!/usr/bin/env node

import path from 'path'
import ProductionLine from './productionline/index.js'
import ESBuild from 'esbuild'

const builder = new ProductionLine({
  name: 'jet-build',
  description: 'Build tool to produce Jet UI Library distribution package',
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

      handler ({ flag }, { project, tasks }) {
        const { source, output, version } = project

        tasks.add('Cleaning output directory', next => {
          builder.clean()
          next()
        })

        tasks.add('Creating bundle', async (next) => {
          const cfg = {
            entryPoints: [path.join(source, 'index.js')],
            outfile: path.join(output, 'index.js'),
            minify: true,
            keepNames: true,
            bundle: true,
            external: ['os'],
            sourcemap: true,
            target: ['es2020'],
            format: 'esm',
            color: true,
            metafile: true,

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
          }

          const { warnings, metafile } = await ESBuild.build(cfg).catch(e => {
            console.error(e)
            process.exit(1)
          })

          if (warnings.length > 0) {
            warnings.forEach(console.log)
          }

          const bytes = metafile.outputs[path.join(path.basename(output), 'index.js')].bytes
          console.log(`        Output size: ${Math.round(((bytes / 1024) + Number.EPSILON) * 100) / 100}kb`)

          await project.copyFile('index.html')

          next()
        })
      }
    },

    
  ]
})

builder.run(process.argv)

