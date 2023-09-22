import View from './View.js';
import poster from 'url:../../img/poster-empty.svg'; // Parcel 2

class PreviewView extends View {
  _parentElement = '';

  _generateMarkup() {
    const id = window.location.hash.slice(1);

    // console.log('this._data', this._data);
    // console.log('id', id);

    return `
    <li class="preview">
      <a class="preview__link ${
        this._data.id === id ? 'preview__link--active' : ''
      }" href="#${this._data.id}">
        <figure class="preview__fig">
          <img src="${
            this._data.poster === 'N/A' ? poster : this._data.poster
          }" alt="${this._data.title}" />
        </figure>
        <div class="preview__data">
          <h4 class="preview__title">${this._data.title}</h4>
          <p class="preview__year">${this._data.year}</p>
          <p class="preview__type">${this._data.type}</p>
          <div class="preview__user-generated ${
            this._data.ratingByUser ? '' : 'hidden'
          }">
          ${this._data.ratingByUser}
          </div>
        </div>
      </a>
    </li>
  `;
  }
}

export default new PreviewView();
