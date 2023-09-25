import View from './View.js';
import previewView from './previewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.search-results');
  _statusElement = this._parentElement.querySelector('.status');
  _currentElement = this._parentElement.querySelector('.results__list');

  _generateMarkup() {
    if (!this._data) return '';
    return this._data.map(item => previewView.render(item, false)).join('');
  }
}

export default new ResultsView();
