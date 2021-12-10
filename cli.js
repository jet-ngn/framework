#!/usr/bin/env node

import { exec } from 'child_process'
import { Shell } from '@author.io/shell'

const shell = new Shell({
  name: 'jet-dev',
  description: 'Jet development environment CLI',
  version: '0.0.1',

  commands: [
    {
      name: 'build',

      handler ({ input }) {
        exec(`node ./build/cli.js build${input ? ` ${input}` : ''}`, (error, stdout, stderr) => {
          if (error) {
            return console.log(`error: ${error.message}`)
          }
          
          if (stderr) {
            return console.log(`stderr: ${stderr}`)
          }

          console.log(stdout)
        })
      }
    }
  ]
})

shell.exec(process.argv.slice(2).join(' '))