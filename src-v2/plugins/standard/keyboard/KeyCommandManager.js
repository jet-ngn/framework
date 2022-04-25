import KeyCommand from './KeyCommand.js'
import Layout from './Layout.js'

export default class KeyCommandManager {
  #context
  #preventDefaults
  #commands
  #previous = null
  #current = null
  #os
  #layout
  #initialized = false
  #enabled = false

  constructor (context, os, layout, commands, preventDefaults) {
    this.#context = context
    this.#preventDefaults = preventDefaults
    this.#os = os
    this.#layout = new Layout(layout)
    this.#commands = commands
  }

  get commands () {
    return this.#commands
  }

  initialize () {
    if (this.#initialized) {
      return
    }

    this.#commands = this.#createCommands(this.#commands)

    if (document.activeElement === this.#context.root.element) {
      this.#enable()
    }

    this.#context.root.on('click', evt => {
      if (evt.target === this.#context.root.element && !this.#enabled) {
        this.#enable()
      }
    })

    document.addEventListener('focusin', evt => {
      if (
        this.#context.root.contains(evt.target)
        && !['INPUT', 'SELECT', 'TEXTAREA'].includes(evt.target.tagName)
        && evt.target.isContentEditable
      ) {
        return this.#enable()
      }

      this.#disable()
    })

    this.#initialized = true
  }

  #createCommands = cfg => Object.keys(cfg).reduce((commands, command) => {
    command = new KeyCommand(this.#context, this.#os, command, cfg[command])
    commands[this.#generateCommandName(command.keys)] = command
    return commands
  }, {})

  #disable = () => {
    if (!this.#enabled) {
      return
    }

    this.#context.root.off('keydown')
    this.#enabled = false
  }

  #enable = () => {
    if (this.#enabled) {
      return
    }

    this.#context.root.on('keydown', this.#keydownHandler)
    this.#enabled = true
  }

  #generateCommandName = keys => {
    const name = keys.reduce((name, key) => {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
        name.modifiers.push(key)
      } else {
        name.keys.push(key)
      }

      return name
    }, {
      modifiers: [],
      keys: []
    })

    if (name.keys.length > 1) {
      throw new Error(`Key Commands must consist of a single key plus modifiers`)
    }

    return this.#getCommandName({
      code: name.keys[0],
      ctrlKey: name.modifiers.includes('Control'),
      altKey: name.modifiers.includes('Alt'),
      shiftKey: name.modifiers.includes('Shift'),
      metaKey: name.modifiers.includes('Meta')
    })
  }

  #getCommandName = ({ code, ctrlKey, altKey, shiftKey, metaKey }) => {
    let name = ''

    if (ctrlKey) {
      name += 'Control+'
    }

    if (metaKey) {
      name += 'Meta+'
    }

    if (shiftKey) {
      name += 'Shift+'
    }

    if (altKey) {
      name += 'Alt+'
    }

    return `${name}${code}`
  }

  #keydownHandler = evt => {
    if (this.#preventDefaults) {
      evt.preventDefault()
      evt.stopPropagation()
    }

    if (['Meta', 'Shift', 'Control', 'Alt'].includes(evt.key)) {
      return
    }

    const command = this.#commands[this.#getCommandName(evt)]

    if (!command) {
      return
    }

    this.#previous = this.#current
    this.#current = command

    if (this.#current === this.#previous) {
      if (evt.repeat && !command.hold) {
        return
      }
    } else if (evt.repeat) {
      return
    }

    command.execute()
  }
}
