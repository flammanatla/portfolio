import View from './View.js';
import previewView from './previewView.js';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMsg = 'No bookmarks yet. Find a nice recipe and bookmark it :)';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }

  // _generateMarkup() {
  //   return this._data
  //     .map(bookmark => previewView.generateMarkup(bookmark)) // render(bookmark, false))
  //     .join('');
  // }
}

export default new BookmarksView();
