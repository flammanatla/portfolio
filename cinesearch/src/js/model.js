import { API_KEY, API_URL } from './config';
import { AJAX } from './helpers';
import { RES_PER_PAGE } from './config.js';

export const state = {
  movie: {},
  search: {
    query: '',
    currentPageResults: [],
    totalResults: 1,
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  watchlist: [],
  ratings: [],
};

const createMovieObject = function (data) {
  return {
    id: data.imdbID,
    poster: data.Poster,
    title: data.Title,
    year: data.Year,
    genre: data.Genre,
    director: data.Director,
    writer: data.Writer,
    stars: data.Actors,
    language: data.Language,
    country: data.Country,
    runtime: data.Runtime,
    plot: data.Plot,
    awards: data.Awards,
    ratings: data.Ratings,
    type: data.Type,
  };
};

export const loadMovie = async function (id) {
  const response = await AJAX(`${API_URL}?i=${id}&apikey=${API_KEY}`);

  state.movie = createMovieObject(response);

  if (state.watchlist.some(bookmark => bookmark.id === id)) {
    state.movie.watchlisted = true;
  } else {
    state.movie.watchlisted = false;
  }

  console.log('state.movie', state.movie);
  console.log('state.watchlist', state.watchlist);
};

export const loadSearchResults = async function (query, page = 1) {
  state.search.query = query;
  const data = await AJAX(
    `${API_URL}?s=${query}&apikey=${API_KEY}&page=${page}`
  );

  state.search.currentPageResults = data.Search.map(movie => {
    return {
      id: movie.imdbID,
      poster: movie.Poster,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
    };
  });
  state.search.page = page;

  state.search.totalResults = Number(data.totalResults);
};

export const getSearchResultsPage = async function (page = state.search.page) {
  state.search.page = page;

  if (state.search.query) {
    await loadSearchResults(state.search.query, page);
  }
  return state.search.currentPageResults;
};

const persistWatchlist = function () {
  localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
};

export const addToWatchlist = function (movie) {
  // add to watchlist
  state.watchlist.push(movie);

  // mark curr movie as watchlisted
  if (movie.id == state.movie.id) {
    state.movie.watchlisted = true;
  }

  persistWatchlist();
};

export const removeFromWatchlist = function (id) {
  const index = state.watchlist.findIndex(el => el.id === id);
  state.watchlist.splice(index, 1);

  // unlist the movie
  if (id == state.movie.id) {
    state.movie.watchlisted = false;
  }

  persistWatchlist();
};

const init = function () {
  const storage = localStorage.getItem('watchlist');

  if (storage) {
    state.watchlist = JSON.parse(storage);
  }
};
init();
