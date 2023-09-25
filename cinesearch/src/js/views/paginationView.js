import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.search-results');
  _statusElement = this._parentElement.querySelector('.status');
  _currentElement = this._parentElement.querySelector('.pagination');

  _generateMarkup() {
    const currentPage = this._data.page;
    const nextBtn = `
      <button data-goto="${
        currentPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${currentPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
      `;
    const prevBtn = `
      <button data-goto="${
        currentPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${currentPage - 1}</span>
      </button>
    `;
    const numPages = Math.ceil(
      this._data.totalResults / this._data.resultsPerPage
    );

    // current page 1, there are other pages
    if (currentPage === 1 && numPages > 1) {
      return nextBtn;
    }

    // current page is last one
    if (currentPage === numPages && numPages > 1) {
      return prevBtn;
    }

    // current page is somewhere in the middle, there are pages before and after
    if (currentPage < numPages) {
      return prevBtn + nextBtn;
    }

    // current page 1, there are no more pages
    return '';
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }
}

export default new PaginationView();
