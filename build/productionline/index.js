import path from 'path'
import fs from 'fs-extra'
import EventEmitter from 'events'
import ESBuild from 'esbuild'
import glob from 'glob'
import chokidar from 'chokidar'
import { PerformanceObserver, performance } from 'perf_hooks'
import CLIUI from 'cliui'
import chalk from 'chalk'
import Queue from 'shortbus'

class Project {
  #root
  #pkg
  #source
  #output
  #ignoredPaths = []

  constructor ({ root, source, output, ignore }) {
    this.#root = path.resolve(root ?? process.cwd())
    this.#pkg = JSON.parse(fs.readFileSync(path.join(this.#root, 'package.json')))
    this.#source = path.resolve(this.#root, source ?? './src')
    this.#output = path.resolve(this.#root, output ?? './.dist')
    this.#ignoredPaths = ignore ?? []
  }

  get bugsURL () {
    return this.#pkg.bugs?.url ?? 'NO BUGS URL SPECIFIED'
  }

  get description () {
    return this.#pkg.description ?? ''
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

  get license () {
    return this.#pkg.license ?? 'NO LICENSE'
  }

  get source () {
    return this.#source
  }

  get version () {
    return this.#pkg.version ?? 'NO VERSION INFORMATION'
  }

  get homepage () {
    return this.#pkg.homepage ?? 'NO HOMEPAGE SPECIFIED'
  }

  clearDirectory (dirpath) {
    return fs.emptyDirSync(path.join(this.#output, dirpath))
  }

  clearOutputDirectory () {
    return this.clearDirectory('')
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
      await this.copyFile(filepath)
      // await fs.copy(path.join(this.#source, filepath), path.join(this.#output, filepath))
    }
  }

  async copyFile (from, to) {
    return await fs.copy(path.join(this.#source, from), path.join(this.#output, to ?? from))
  }

  async writeFile (filepath, contents) {
    return await fs.writeFile(path.join(this.#output, filepath), contents)
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
}

export default class ProductionLine extends EventEmitter {
  #project
  #completed = false
  #tasks = new Queue
  #stdout = new CLIUI({ wrap: true })
  #watcher = null

  #observer = new PerformanceObserver(items => {
    const entry = items.getEntries()[0]
  
    this.#stdout.span({
      text: `${this.#completed ? chalk.bold('Build completed') : '...Done'} in ${entry.duration}ms.`,
      padding: [this.#completed ? 1 : 0, 0, 1, this.#completed ? 3 : 8]
    })
  
    console.log(this.#stdout.toString())
    this.#stdout.resetOutput()
  })

  constructor ({ name, description, version, commands }) {
    super()
    this.#project = new Project(arguments[0])
    
    ;['name'].forEach(property => {
      if (!arguments[0].hasOwnProperty(property)) {
        console.error(`ProductionLine configuration error: "${property}" property is required!`)
        return process.exit(1)
      }
    })
  }

  get project () {
    return this.#project
  }

  clean () {
    return this.#project.clearOutputDirectory()
  }

  addTask (name, callback) {
    this.#tasks.add(...arguments)
  }

  clearTasks () {
    this.#tasks = new Queue
  }

  async bundle (cfg) {
    const { aliases } = cfg

    cfg = {
      ...cfg,
      
      keepNames: true,
      color: true,
      metafile: true,

      plugins: [{
        name: 'path-aliases',
        
        setup (build) {
          (aliases ?? []).forEach(({ filter, filepath }) => {
            build.onResolve({ filter }, args => ({ path: filepath }))
          })
        },
      }]
    }

    delete cfg.aliases

    const { output } = this.#project

    const { warnings, metafile } = await ESBuild.build(cfg).catch(e => {
      console.error(e)
      process.exit(1)
    })

    if (warnings.length > 0) {
      warnings.forEach(console.log)
    }

    let bytes = 0

    cfg.entryPoints.forEach(entry => {
      bytes += metafile.outputs[path.join(path.basename(output), path.basename(entry))].bytes
    })

    console.log(`        Output size: ${Math.round(((bytes / 1024) + Number.EPSILON) * 100) / 100}kb`)
  }

  run () {
    this.#completed = false
    const { name, version, source, output, ignoredPaths } = this.#project

    this.#stdout.div({
      text: chalk.bold(`Building ${name} v${version}`),
      padding: [1,0,1,3]
    })

    this.#stdout.div({
      text: chalk.bold('Source:'),
      width: 20,
      padding: [0,0,0,3]
    }, {
      text: source
    })

    this.#stdout.div({
      text: chalk.bold('Output:'),
      width: 20,
      padding: [0,0,1,3]
    }, {
      text: output
    })

    if (this.#project.hasIgnoredPaths) {
      this.#stdout.div({
        text: `Ignored: ${ignoredPaths.join(', ')}`,
        padding: [1,0,1,3]
      })
    }

    console.log(this.#stdout.toString())
    this.#stdout.resetOutput()

    const start = `${this.#project.name} build start`
    const end = `${this.#project.name} build end`

    performance.mark(start)
    this.#observer.observe({ entryTypes: ['measure'] })
    
    this.#tasks.on('stepstarted', ({ name, number }) => {
      performance.mark(`${name} start`)

      this.#stdout.div({
        text: `${number}) ${name}`,
        padding: [0,0,0,5]
      })

      console.log(this.#stdout.toString())
      this.#stdout.resetOutput()
    })

    this.#tasks.on('stepcomplete', ({ name }) => {
      const start = `${name} start`
      const end = `${name} end`

      performance.mark(end)
      performance.measure(`${name} time elapsed`, start, end)
    })

    this.#tasks.on('complete', () => {
      this.#completed = true

      performance.mark(end)
      performance.measure('time elapsed', start, end)
      performance.clearMarks()
      
      this.#observer.disconnect()
      this.#completed && this.emit('complete')
    })

    this.#tasks.run(true)
  }

  unwatch () {
    if (!this.#watcher) {
      return
    }

    this.#unwatch()
  }

  watch (cb) {
    const { source, ignoredPaths } = this.#project

    this.#stdout.div({
      text: `Monitoring ${source} for changes...`,
      padding: [0,0,0,3]
    })

    this.#stdout.div({
      text: 'Press ctrl+c to exit.',
      padding: [1,0,1,3]
    })

    console.log(this.#stdout.toString())
    
    if (!!this.#watcher) {
      this.#unwatch(true)
    }

    this.clearTasks()

    this.#watcher = chokidar.watch(path.join(source, path.sep), {
      ignored: ignoredPaths,
      ignoreInitial: true,
      persistent: true
    })

    this.#watcher.on('change', cb).on('error', err => {
      console.error(err)
      process.exit(1)
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
