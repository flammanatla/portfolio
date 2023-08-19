import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import movieView from './views/movieView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';

const controlMovies = async function () {
  const id = window.location.hash.slice(1);
  console.log(id);

  if (!id) return;

  // render results
  resultsView.render(model.getSearchResultsPage());

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
  resultsView.render(model.getSearchResultsPage());

  // render initial pagination buttons
  //paginationView.render(model.state.search);
};

const init = function () {
  movieView.addHandlerRender(controlMovies);
  searchView.addHandlerSearch(controlSearchResults);
};
init();
