import View from './View.js';
import previewView from './previewView.js';

class WatchlistView extends View {
  _parentElement = document.querySelector('.watchlist-container');
  _statusElement = this._parentElement.querySelector('.status');
  _currentElement = this._parentElement.querySelector('.watchlist__list');

  //_errorMsg = 'No movies in watchlist yet.';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data.map(item => previewView.render(item, false)).join('');
  }
}

export default new WatchlistView();
