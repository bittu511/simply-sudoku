window.customElements.define(
  'simply-sudoku-cell', 
  class extends HTMLElement {  
    constructor () {
      // Always call super first in constructor
      super();
      // Create the shadow root
      this.shadow = this.attachShadow({mode: 'open'});
    }
    // This hook is called when the element is added to the DOM tree
    connectedCallback () { 
      this.render()
    }
    // This method actually fills in our template
    render () {
      this.shadow.innerHTML = `
        <div 
            data-x="${this.getAttribute('x') || '0'}"
            data-y="${this.getAttribute('y') || '0'}"
            data-error="${this.getAttribute('error') || 'false'}"
        >
            ${this.getAttribute('value') || '0'}
        </div>
      `
    }
  }
)