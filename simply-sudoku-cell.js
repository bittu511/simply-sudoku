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

          .x-cell > .dialer {
            width: 480%;
            height: 480%;
            z-index: 100;
            grid-area: 1 / 1 / 2 / 2;
            visibility: hidden;
          }
          .x-cell > .dialer > .dial {
            width: 100%;
            height: 100%;
            background: url("./assets/dial.svg");
            background-size: 100% 100%;
          }
          .x-cell > .dialer > .shadow {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.65);
            z-index: -10;
          }
          
        </style>
        <div class = "x-cell"></div>
      `
    }
    static get observedAttributes() {return ['value', 'disabled', 'err']}
    attributeChangedCallback (attr, oldValue, newValue) {
      this.render()
    }
    render () {
      const root = this.shadow.querySelector('.x-cell')
      root.innerHTML = `
          <div class = "cell
              ${(this.hasAttribute('disabled') ? 'disabled' : '')}
              ${(this.hasAttribute('err') ? 'err' : '')}">
              ${this.getAttribute('value')}</div>
          <div class = "dialer">
            <div class = "dial"></div>
            <div class = "shadow"></div>
          </div>
      `
      
      const cell = root.querySelector('.cell')
      const dialer = root.querySelector('.dialer')
      const dial = root.querySelector('.dial')
      
      if (!this.hasAttribute('disabled')) cell.addEventListener('pointerdown', (ev) => {
        dialer.style.visibility = 'visible'
        dialer.style.opacity = '0'
        ev.preventDefault()
      })
      
      const calcValue = (ev) => {
        const x = ev.pageX - dial.offsetLeft - dial.clientWidth/2
        const y = ev.pageY - dial.offsetTop - dial.clientHeight/2
        const t = Math.PI*2
        const d = Math.sqrt(x*x + y*y)
        const r = Math.atan2(y, x)
        const e = Math.ceil(((r + (t/4 + t/9/2) + t) % t) / (t/9))
        const l = d >= dial.clientWidth/2**0.5 * 0.25
        return { value: e, limit: l }
      }
      dialer.addEventListener('pointerup', (ev) => {
        const { value, limit } = calcValue(ev)
        if (limit) {
          this.setAttribute('value', value)
          this.dispatchEvent(new CustomEvent('valueChanged', {
            detail: { value },
            bubbles: true
          }))
        } else {
          dialer.style.opacity = '1'
          //TODO: Only show dial if instantaneous, not if returning to neutral after a while.
        }
      })
      dialer.addEventListener('pointermove', (ev) => {
        const { value, limit } = calcValue(ev)
        if (limit) {
          cell.innerHTML = value
        } else {
          cell.innerHTML = this.getAttribute('value')
        }
      })
    }
  }
)
