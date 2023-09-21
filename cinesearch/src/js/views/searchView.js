class SearchView {
  _parentElement = document.querySelector('.search');

  #clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this.#clearInput();
    history.pushState(
      { searchQuery: query },
      null,
      `?q=${encodeURIComponent(query)}`
    );
    return query;
  }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
