import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import movieView from './views/movieView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';

const controlMovies = async function () {
  // get id from address bar
  const id = window.location.hash.slice(1);

  // get search query from address bar
  const url = new URL(window.location.href);
  model.state.search.query = url.searchParams.get('q');

  // render results
  resultsView.render(await model.getSearchResultsPage());

  // if movieId not entered, do not load and render movie info
  if (!id) return;

  // loading a movie
  await model.loadMovie(id);

  // rendering a movie
  movieView.render(model.state.movie);
};

const controlSearchResults = async function () {
  //resultsView.renderSpinner();

  // get search query
  const query = searchView.getQuery();
  if (!query) return;

  // load search results
  await model.loadSearchResults(query);

  // render results
  resultsView.render(await model.getSearchResultsPage());

  // render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlPagination = async function (goToPage) {
  // render NEW results
  resultsView.render(await model.getSearchResultsPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

const init = function () {
  movieView.addHandlerRender(controlMovies);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
};
init();
