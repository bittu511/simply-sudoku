/*NOTE
*DONE value     - integer   constrained to 0~9
*DONE disabled  - boolean
*DONE err     - boolean
* focus()
*DONE Clicking displays the radial menu centered on the element
*DONE Clicking on a radial menu digit triggers the `valueChanged` event and then closes it
* Dragging on a cell directly triggers `valueChanged` w/o showing the menu
* Long pressing on cell triggers the `valueChanged` event with `0`
 */

//TODO: Convert prototype to webcomponent.

window.customElements.define(
  'x-cell',
  class extends HTMLElement {
    constructor () {
      // Always call super first in constructor
      super()
      // Create the shadow root
      this.shadow = this.attachShadow({mode: 'open'})
    }
    static get observedAttributes() {return ['value', 'disabled', 'err']}
    attributeChangedCallback (attr, oldValue, newValue) {
      console.log(attr, oldValue, newValue)
      this.render()
    }
    // This hook is called when the element is added to the DOM tree
    connectedCallback () {
      this.render()
    }
    // This method actually fills in our template
    render () {
      this.shadow.innerHTML = `
        <style>
          .x-cell {
            height: 30px;
            width: 30px;
            display: grid;
            align-items: center;
            justify-items: center;
            cursor: pointer;
          }
          .x-cell.disabled {
            opacity: 0.5;
          }

          .x-cell > .cell {
            width: 100%;
            height: 100%;
            background-color: cyan;
            grid-area: 1 / 1 / 2 / 2;
            text-align: center;
            line-height: 1.8em;
          }
          .x-cell.err > .cell {
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
        <div class = "x-cell
          ${(this.getAttribute('disabled') === 'true' ? 'disabled' : '')}
          ${(this.getAttribute('err') === 'true' ? 'err' : '')}">
          <div class = "cell">${this.getAttribute('value')}</div>
          <div class = "dial"></div>
        </div>
      `
      const cell = this.shadow.querySelector('.cell')
      const dial = this.shadow.querySelector('.dial')
      if (this.getAttribute('disabled') !== 'true') cell.addEventListener('click', (ev) => {
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
        console.log('HERE IT IS : X:' + x + '  Y:' + y, e)
      })
    }
  }
)
