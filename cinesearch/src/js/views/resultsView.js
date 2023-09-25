import View from './View.js';
import previewView from './previewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMsg =
    'No movies found for your query! Please search for something else';

  _generateMarkup() {
    return this._data.map(item => previewView.render(item, false)).join('');
  }
}

export default new ResultsView();
