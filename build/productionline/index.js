import path from 'path'
import fs from 'fs-extra'
import { Shell } from '@author.io/shell'
import glob from 'glob'
import chokidar from 'chokidar'
import { PerformanceObserver, performance } from 'perf_hooks'
import CLIUI from 'cliui'
import chalk from 'chalk'
import Queue from 'shortbus'

const stdout = new CLIUI({
  wrap: true
})

const observer = new PerformanceObserver(items => {
  const entry = items.getEntries()[0]
  const complete = entry.name === 'time elapsed'

  stdout.span({
    text: `${complete ? chalk.bold('Build completed') : '...Done'} in ${entry.duration}ms.`,
    padding: [complete ? 1 : 0, 0, 1, complete ? 3 : 8]
  })

  console.log(stdout.toString())
  stdout.resetOutput()
})

class Project {
  #root
  #pkg
  #source
  #output
  #ignoredPaths = []
  #watcher

  constructor ({ root, source, output, ignore }) {
    this.#root = path.resolve(root ?? process.cwd())
    this.#pkg = JSON.parse(fs.readFileSync(path.join(this.#root, 'package.json')))
    this.#source = path.resolve(this.#root, source ?? './src')
    this.#output = path.resolve(this.#root, output ?? './.dist')
    this.#ignoredPaths = ignore ?? []
  }

  get output () {
    return this.#output
  }

  get hasIgnoredPaths () {
    return this.#ignoredPaths.length > 0
  }

  get name () {
    return this.#pkg.name ?? 'UNNAMED PROJECT'
  }

  get source () {
    return this.#source
  }

  get version () {
    return this.#pkg.version ?? 'NO VERSION INFORMATION'
  }

  async clearDirectory (dirpath) {
    return fs.emptyDirSync(path.join(this.#output, dirpath))
  }

  async clearOutputDirectory () {
    return await this.clearDirectory('')
  }

  async copyDirectory ({ from, to, pattern = '', ignore }) {
    const source = path.resolve(this.#source, from)

    const filepaths = this.getFilepaths({
      pattern: path.join(from, pattern),
      ignore
    })

    if (filepaths.length === 0) {
      return
    }

    for (const filepath of filepaths) {
      await fs.copy(path.join(this.#source, filepath), path.join(this.#output, filepath))
    }
  }

  /**
   * Retrieves all files matching the specified pattern within a directory
   * @param  {string} pattern
   * Glob pattern
   * @return {Array}
   * An array containing the absolute path of each file in the directory.
   */
  getFilepaths ({ root, pattern, ignore = [] }) {
    if (!pattern) {
      return []
    }

    return glob.sync(pattern, {
      cwd: root ?? this.#source,
      ignore: [...this.#ignoredPaths, ...(Array.isArray(ignore) ? ignore : [ignore])]
    })
  }

  unwatch () {
    if (!this.#watcher) {
      return
    }

    this.#unwatch()
  }

  watch (cb) {
    if (this.#watcher) {
      this.#unwatch(true)
    }

    this.#watcher = chokidar.watch(path.join(this.#source, path.sep), {
      ignored: this.#ignoredPaths,
      ignoreInitial: true,
      persistent: true
    })

    this.#watcher
      .on('change', cb)
      .on('error', err => {
        console.log(err)
        process.end(1)
      })
  }

  #unwatch = (suppressEvents = false) => {
    this.#watcher.close()
    this.#watcher = null

    if (!suppressEvents) {
      this.emit('unwatch')
    }
  }
}

export default class ProductionLine {
  #shell
  #project
  #tasks = new Queue

  constructor ({ name, description, version, commands }) {
    this.#project = new Project(arguments[0])
    
    ;['name', 'commands'].forEach(property => {
      if (!arguments[0].hasOwnProperty(property)) {
        console.error(`ProductionLine configuration error: "${property}" property is required!`)
        return process.exit(1)
      }
    })

    this.#shell = new Shell({ name, description, version, commands })
  }

  get project () {
    return this.#project
  }

  async clean () {
    await this.#project.clearOutputDirectory()
  }

  exec (command, cb) {
    this.#shell.exec(command, this.#tasks, cb)
  }

  run (args) {
    const { name, version, source, output, ignoredPaths } = this.#project

    stdout.div({
      text: chalk.bold(`Building ${name} v${version}`),
      padding: [1,0,1,3]
    })

    stdout.div({
      text: chalk.bold('Source:'),
      width: 20,
      padding: [0,0,0,3]
    }, {
      text: source
    })

    stdout.div({
      text: chalk.bold('Output:'),
      width: 20,
      padding: [0,0,1,3]
    }, {
      text: output
    })

    if (this.#project.hasIgnoredPaths) {
      stdout.div({
        text: `Ignored: ${ignoredPaths.join(', ')}`,
        padding: [1,0,1,3]
      })
    }

    console.log(stdout.toString())
    stdout.resetOutput()

    const start = `${this.#project.name} build start`
    const end = `${this.#project.name} build end`

    performance.mark(start)
    observer.observe({ entryTypes: ['measure'] })
    
    this.#shell.exec(args.slice(2).join(' '), this.#tasks)

    this.#tasks.on('stepstarted', ({ name, number }) => {
      performance.mark(`${name} start`)

      stdout.div({
        text: `${number}) ${name}`,
        padding: [0,0,0,5]
      })

      console.log(stdout.toString())
      stdout.resetOutput()
    })

    this.#tasks.on('stepcomplete', ({ name, number }) => {
      const start = `${name} start`
      const end = `${name} end`

      performance.mark(end)
      performance.measure(`${name} time elapsed`, start, end)
    })

    this.#tasks.run(true)
    
    performance.mark(end)
    performance.measure('time elapsed', start, end)
    performance.clearMarks()
    
    observer.disconnect()
  }
}
