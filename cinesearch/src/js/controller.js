import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import movieView from './views/movieView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import watchlistView from './views/watchlistView.js';
import ratedListView from './views/ratedListView.js';

const controlMovies = async function () {
  // get id from address bar
  const id = window.location.hash.slice(1);

  // get search query from address bar
  const url = new URL(window.location.href);
  model.state.search.query = url.searchParams.get('q');

  // render results
  let shouldRender =
    model.state.search.currentPageResults === null ? true : false;
  const searchResults = await model.getSearchResultsPage();
  if (searchResults) {
    shouldRender
      ? resultsView.render(searchResults)
      : resultsView.update(searchResults);
  }

  // render initial pagination buttons
  paginationView.render(model.state.search);

  // if movieId not entered, do not load and render movie info
  if (!id) return;

  // loading a movie
  await model.loadMovie(id);

  // rendering a movie
  movieView.render(model.state.movie);

  // add movie to rated list once rate is submitted
  // impossible to move to init() because rate form is hidden on the very beginning
  // and it is impossiblt to attach eventListener to hidden element
  movieView.addHandlerAddToRatings(controlAddToRatings);

  // render rated movies
  ratedListView.render(model.state.ratingsByUser);

  // render watchlisted movies
  watchlistView.render(model.state.watchlist);
};

const controlSearchResults = async function () {
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

const controlAddToWatchlist = function () {
  // add or remove movie from watchlist
  if (!model.state.movie.watchlisted) {
    model.addToWatchlist(model.state.movie);
  } else {
    model.removeFromWatchlist(model.state.movie.id);
  }

  // update movie view
  movieView.update(model.state.movie);

  // render watchlisted movies
  watchlistView.render(model.state.watchlist);
};

const controlWatchlist = function () {
  // render watchlisted movies
  watchlistView.render(model.state.watchlist);
};

const controlAddToRatings = function (rating) {
  // add movie to rated movies list
  model.addToRatings(model.state.movie, rating);

  // update movie view
  movieView.update(model.state.movie);

  // render rated movies
  ratedListView.render(model.state.ratingsByUser);
};

const controlRemoveFromRatings = function () {
  // remove movie from rated list by id
  model.removeFromRatings(model.state.movie.id);

  movieView.update(model.state.movie);

  ratedListView.render(model.state.ratingsByUser);
};

const controlRatings = function () {
  ratedListView.render(model.state.ratingsByUser);
};

const init = function () {
  // load movie data once URL is changed
  movieView.addHandlerRender(controlMovies);

  // search once search query is entered
  searchView.addHandlerSearch(controlSearchResults);

  // update pagination once user is moving forward/backward
  paginationView.addHandlerClick(controlPagination);

  //render watchlist window once Watchlist button is hovered
  watchlistView.addHandlerRender(controlWatchlist);

  // add movie to watchlist when button is clicked
  movieView.addHandlerAddToWatchlist(controlAddToWatchlist);

  //render ratings window once Rating button is hovered
  ratedListView.addHandlerRender(controlRatings);

  // show rating input OR call handler to remove rating
  movieView.addHandlerShowRatingInput(controlRemoveFromRatings);
};
init();
