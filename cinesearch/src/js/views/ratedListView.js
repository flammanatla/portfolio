import View from './View.js';
import previewView from './previewView.js';

class RatedListView extends View {
  _parentElement = document.querySelector('.ratings__list');
  _errorMsg = 'No rated movies yet. Find a nice movie and rate it :)';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new RatedListView();
