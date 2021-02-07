import { Entity, Partial, html, ready } from '../../src/index.js'

const Dot = Partial({
  name: 'dot',

  render (count) {
    return html`
      ${this.bind({
        css: `
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5625vw;
          height: 1.5625vw;
          background: rgb(97, 218, 251);
          border-radius: 50%;
        `
      }, html`<div>${count}</div>`)}
    `
  }
})

const Row = Partial({
  name: 'row',

  render (children) {
    return html`
      ${this.bind({
        css: `
          display: flex;
          justify-content: center;
          width: 100%;
        `
      }, html`<div>${children}</div>`)}
    `
  }
})

const Spacer = Partial({
  name: 'spacer',

  render (multiplier = 1) {
    return html`
      ${this.bind({
        css: `
          flex: 0 0 auto;
          width: ${multiplier * 1.5625}vw;
          height: ${multiplier * 1.5625}vw;
        `
      }, html`<div></div>`)}
    `
  }
})

const SmallTriangle = new Partial({
  name: 'triangle.small',

  render (count) {
    return html`
      ${this.bind({
        css: `
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 6.25vw;
        `
      }, html`
        <div>
          ${Dot.render(count)}
          ${Row.render(html`
            ${Dot.render(count)}
            ${Dot.render(count)}
          `)}
          ${Row.render(html`
            ${Dot.render(count)}
            ${Spacer.render()}
            ${Dot.render(count)}
          `)}
          ${Row.render(html`
            ${Dot.render(count)}
            ${Dot.render(count)}
            ${Dot.render(count)}
            ${Dot.render(count)}
          `)}
        </div>
      `)}
    `
  }
})

const width = 6.25

const MediumTriangle = Partial({
  name: 'triangle.medium',

  render (count) {
    return html`
      ${this.bind({
        css: `
          width: ${2 * width}vw;
          margin: auto;
        `
      }, html`
        <div>
          ${this.bind({
            css: `
              display: flex;
              width: ${width}vw;
              margin: 0 auto;
            `
          }, html`<div>${SmallTriangle.render(count)}</div>`)}

          ${this.bind({
            css: `
              display: flex;
              margin: 0 auto;
              width: ${2 * width}vw;
            `
          }, html`
            <div>
              ${SmallTriangle.render(count)}
              ${SmallTriangle.render(count)}
            </div>
          `)}
        </div>
      `)}
    `
  }
})

const BigTriangle = Partial({
  name: 'triangle.big',

  render (count) {
    return html`
      <div>
        ${MediumTriangle.render(count)}

        ${this.bind({
          css: `
            display: flex;
            justify-content: center;
            width: ${4 * width}vw;
            margin: 0 auto;
          `
        }, html`
          <div>
            ${MediumTriangle.render(count)}
            ${MediumTriangle.render(count)}
          </div>
        `)}
      </div>
    `
  }
})

const App = new Entity({
  selector: 'body',
  name: 'sierpinski',

  data: {
    count: {
      type: Number,
      default: 0
    }
  },

  on: {
    initialize () {
      this.root.style.margin = 0
      this.emit('render')

      const timer = setInterval(() => {
        this.data.count = this.data.count === 10 ? 0 : this.data.count + 1
      }, 1000)
    },

    render () {
      const count = this.data.bind('count')

      this.render(html`
        <h1>Sierpinski Stress Test (WIP)</h1>

        ${BigTriangle.render(count)}

        ${this.bind({
          css: `
            display: flex;
            width: ${8 * width}vw;
            margin: 0 auto;
          `
        }, html`
          <div>
            ${BigTriangle.render(count)}
            ${BigTriangle.render(count)}
          </div>
        `)}

        ${this.bind({
          css: `
            display: flex;
            width: ${12 * width}vw;
            margin: 0 auto;
          `
        }, html`
          <div>
            ${BigTriangle.render(count)}
            ${Spacer.render(16)}
            ${BigTriangle.render(count)}
          </div>
        `)}

        ${this.bind({
          css: `
            display: flex;
            width: 100vw;
          `
        }, html`
          <div>
            ${BigTriangle.render(count)}
            ${BigTriangle.render(count)}
            ${BigTriangle.render(count)}
            ${BigTriangle.render(count)}
          </div>
        `)}
      `)
    }
  }
})

ready(() => App.initialize())
