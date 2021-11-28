import { Entity, html, ready } from '../../../src/index.js'

const phrases = [
  'Dolore veniam eu non quis. Tempor pariatur aliquip sit adipisicing occaecat voluptate. Quis aliquip commodo qui voluptate Lorem anim ea velit non deserunt enim dolore sunt occaecat. Ut proident commodo occaecat proident enim ullamco labore. In pariatur anim nostrud labore nostrud consequat nulla pariatur tempor non Lorem in enim amet.',
  'Cupidatat sint in aliqua quis cillum magna. Aliqua id elit id anim ullamco id enim ipsum sunt ex. Occaecat aliqua fugiat eiusmod ullamco anim deserunt ex sunt. Proident esse dolore veniam dolore sunt ipsum officia excepteur sunt id do. Proident tempor nostrud est id pariatur et veniam exercitation ad id adipisicing mollit eu.',
  'Consectetur aute sunt eiusmod velit dolor ullamco. Aute ad mollit deserunt occaecat non ullamco et dolore deserunt laborum velit eiusmod non. Ea quis ipsum ad reprehenderit eiusmod. Ullamco incididunt aute est dolore ea labore nisi elit. Voluptate magna aliquip duis nostrud reprehenderit dolore culpa duis.',
  'Esse aliqua eiusmod sint exercitation magna commodo duis elit laboris. Fugiat reprehenderit exercitation eiusmod officia proident et ut esse labore dolore magna culpa. Magna dolor minim dolore proident laborum elit aliqua adipisicing est et. Qui aliqua ut ex enim labore magna sunt deserunt aliquip ipsum occaecat. Ea enim reprehenderit sit pariatur amet ipsum est. Qui sint exercitation magna proident eu ipsum mollit est exercitation cupidatat laborum amet consectetur. Ad cupidatat consectetur sint eiusmod id sint Lorem pariatur Lorem proident.',
  'Incididunt excepteur sunt anim sit Lorem. Laboris amet magna cillum in quis velit esse minim enim cillum quis ullamco. Nostrud sit consequat adipisicing reprehenderit quis ad consectetur.'
]

function getPhrase (current) {
  const newPhrase = phrases[(Math.random() * ((phrases.length - 1) - 0 + 1)) << 0]

  if (newPhrase === current) {
    return getPhrase(current)
  }

  return newPhrase
}

const Paragraph = new Entity({
  name: 'p',

  data: {
    currentPhrase: String
  },

  on: {
    append (evt, text) {
      this.data.currentPhrase = getPhrase(this.data.currentPhrase)
      this.append(html`${this.data.currentPhrase}`)
    },

    render (evt, text) {
      this.data.currentPhrase = getPhrase(this.data.currentPhrase)
      this.render(html`${this.data.currentPhrase}`)
    },

    replace (evt, text) {
      this.data.currentPhrase = getPhrase(this.data.currentPhrase)
      this.replace(html`${this.data.currentPhrase}`)
    },

    rendered (evt) {
      console.log(evt);
    }
  }
})

const Demo = new Entity({
  selector: 'body',
  name: 'rendering.basic',

  on: {
    initialize () {
      this.render(html`
        <h1>Basic Rendering</h1>

        ${this.bind({
          entity: Paragraph
        }, html`<p></p>`)}

        ${this.bind({
          on: {
            click: evt => this.emit('p.render')
          }
        }, html`<button>Reconcile</button>`)}

        ${this.bind({
          on: {
            click: evt => this.emit('p.replace')
          }
        }, html`<button>Replace</button>`)}

        ${this.bind({
          on: {
            click: evt => this.emit('p.append')
          }
        }, html`<button>Append</button>`)}
      `)

      this.emit('p.render', 'Sit deserunt in dolor excepteur laboris eu sint adipisicing Lorem mollit aliqua consequat qui veniam. Cillum esse aliquip duis dolor sint fugiat nisi aute. Nostrud nisi duis eiusmod reprehenderit Lorem minim. Proident non velit non deserunt eiusmod consequat dolor labore. Ullamco ut proident mollit quis mollit consequat eu labore culpa et incididunt est sunt consectetur.')
    }
  }
})

ready(() => Demo.initialize())
