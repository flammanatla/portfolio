import View from './View.js';
import previewView from './previewView.js';

class WatchlistView extends View {
  _parentElement = document.querySelector('.watchlist__list');
  _errorMsg = 'No movies in watchlist yet.';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new WatchlistView();
