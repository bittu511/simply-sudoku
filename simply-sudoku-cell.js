/*
* value     - integer   constrained to 0~9
* disabled  - boolean
* err       - boolean
* Clicking displays the radial menu centered on the element
* Clicking on a radial menu digit triggers the `valueChanged` event and then closes it
* Dragging on a cell directly triggers `valueChanged` w/o showing the menu
* Long pressing on cell triggers the `valueChanged` event with `0`
* focus() //TODO:
* When focused, the keyboard overwrites the value and triggers `valueChanged` //TODO:
 */

window.customElements.define(
  'x-cell',
  class extends HTMLElement {
    constructor () {
      // Always call super first in constructor
      super()
      // Create the shadow root
      this.shadow = this.attachShadow({mode: 'open'})
      this.shadow.innerHTML = `
        <style>
          .x-cell {
            height: 100%;
            width: 100%;
            display: grid;
            align-items: center;
            justify-items: center;
            cursor: pointer;
          }

          .x-cell > .cell {
            width: 100%;
            height: 100%;
            grid-area: 1 / 1 / 2 / 2;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .x-cell > .cell.disabled {
            color: grey;
          }
          .x-cell > .cell.err  {
            color: red;
          }

          .x-cell > .dial {
            background: url("./assets/dial.svg");
            background-size: 100% 100%;
            width: 300%;
            height: 300%;
            z-index: 100;
            grid-area: 1 / 1 / 2 / 2;
            visibility: hidden;
          }
        </style>
        <div class = "x-cell"></div>
      `
    }
    static get observedAttributes() {return ['value', 'disabled', 'err']}
    attributeChangedCallback (attr, oldValue, newValue) {
      this.render()
    }
    // This hook is called when the element is added to the DOM tree
    // connectedCallback () {
    //   this.render()
    // }
    // This method actually fills in our template
    render () {
      const root = this.shadow.querySelector('.x-cell')
      root.innerHTML = `
          <div class = "cell
              ${(this.hasAttribute('disabled') ? 'disabled' : '')}
              ${(this.hasAttribute('err') ? 'err' : '')}">
              ${this.getAttribute('value')}</div>
          <div class = "dial"></div>
      `
      
      const cell = this.shadow.querySelector('.cell')
      const dial = this.shadow.querySelector('.dial')
      
      if (!this.hasAttribute('disabled')) cell.addEventListener('click', (ev) => {
        dial.style.visibility = 'visible'
      })
      
      dial.addEventListener('click', (ev) => {
        const x = ev.offsetX - ev.target.clientWidth/2
        const y = ev.offsetY - ev.target.clientHeight/2
        const t = Math.PI*2
        const r = Math.atan2(y, x)
        const e = Math.ceil(((r + (t/4 + t/9/2) + t) % t) / (t/9))
        // cell.innerText = e
        this.setAttribute('value', e)
        this.dispatchEvent(new CustomEvent('valueChanged', { detail: { value: e }}))
      })
      
    }
  }
)
