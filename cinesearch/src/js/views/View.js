import spinner from 'bundle-text:../../img/spinner.svg';

export default class View {
  _data;

  #clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g movie)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {object} View instance
   */
  render(data, render = true) {
    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    // if array is empty, show status and hide data section
    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.setStatusVisibility(true);
      this.setDataVisibility(false);
      return;
    }

    this.setStatusVisibility(false);
    this.setDataVisibility(true);

    this._currentElement.innerHTML = '';
    this._currentElement.innerHTML = markup;
  }

  setStatusVisibility(flag) {
    flag
      ? this._statusElement.classList.remove('hidden')
      : this._statusElement.classList.add('hidden');
  }

  setDataVisibility(flag) {
    flag
      ? this._currentElement.classList.remove('hidden')
      : this._currentElement.classList.add('hidden');
  }

  update(data) {
    this._data = data;

    const newMarkup = this._generateMarkup();

    // create "virtual" DOM out of the markup string
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currElements = Array.from(this._currentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = currElements[i];

      // updates changed TEXT
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
}
