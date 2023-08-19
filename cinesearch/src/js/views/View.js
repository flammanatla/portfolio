import icons from 'url:../../img/icons.svg';
import spinner from 'bundle-text:../../img/spinner.svg';

export default class View {
  _data;

  #clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {object} View instance
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return; //this.renderError();
    }

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this.#clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // generateMarkup(data) {
  //   this._data = data;
  //   return this._generateMarkup();
  // }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // create "virtual" DOM out of the markup string
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = currElements[i];

      // updates changed TEXT (number of serving and quantity)
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  // // spinner sits in separate svg file and loaded inline as a string
  // // otherwise svg stack was too heavy and when network was slow, spinner loaded slower than recipe itself
  // renderSpinner() {
  //   const markup = `
  //     <div class="spinner">
  //       ${spinner}
  //     </div>
  //   `;

  //   this.#clear();
  //   this._parentElement.insertAdjacentHTML('afterbegin', markup);
  // }

  // renderError(message = this._errorMsg) {
  //   const markup = `
  //     <div class="error">
  //       <div>
  //         <svg>
  //           <use href="${icons}#icon-alert-triangle"></use>
  //         </svg>
  //       </div>
  //       <p>${message}</p>
  //     </div>
  //   `;
  //   this.#clear();
  //   this._parentElement.insertAdjacentHTML('afterbegin', markup);
  // }

  // renderMessage(message = this._msg) {
  //   const markup = `
  //     <div class="message">
  //       <div>
  //         <svg>
  //           <use href="${icons}.svg#icon-smile"></use>
  //         </svg>
  //       </div>
  //       <p>${message}</p>
  //     </div>
  //   `;

  //   this.#clear();
  //   this._parentElement.insertAdjacentHTML('afterbegin', markup);
  // }
}
