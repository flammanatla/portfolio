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
  ratingsByUser: [],
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

  if (state.watchlist.some(item => item.id === id)) {
    state.movie.watchlisted = true;
  } else {
    state.movie.watchlisted = false;
  }

  if (state.ratingsByUser.some(item => item.id === id)) {
    state.movie.ratedByUser = true;
    state.movie.ratingByUser = state.ratingsByUser.find(
      item => item.id === id
    ).ratingByUser;
  } else {
    state.movie.ratedByUser = false;
  }
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

// add to, remove, store and restore watchlist from localStorage
const persistList = function (type) {
  if (type === 'watchlist') {
    localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
  }

  if (type === 'ratingsByUser') {
    localStorage.setItem('ratingsByUser', JSON.stringify(state.ratingsByUser));
  }
};

export const addToWatchlist = function (movie) {
  // add to watchlist
  state.watchlist.push(movie);

  // mark curr movie as watchlisted
  if (movie.id === state.movie.id) {
    state.movie.watchlisted = true;
  }

  persistList('watchlist');
};

export const removeFromWatchlist = function (id) {
  const index = state.watchlist.findIndex(el => el.id === id);
  state.watchlist.splice(index, 1);

  // unlist the movie
  if (id === state.movie.id) {
    state.movie.watchlisted = false;
  }

  persistList('watchlist');
};

export const addToRatings = function (movie, rating) {
  // add to rated movies list
  state.ratingsByUser.push(movie);

  // mark curr movie as rated
  if (movie.id === state.movie.id) {
    state.movie.ratedByUser = true;
    state.movie.ratingByUser = rating;
  }

  persistList('ratingsByUser');
};

export const removeFromRatings = function (id) {
  const index = state.ratingsByUser.findIndex(el => el.id === id);
  state.ratingsByUser.splice(index, 1);

  // unlist the movie
  if (id === state.movie.id) {
    state.movie.ratedByUser = false;
    state.movie.ratingByUser = '';
  }

  persistList('ratingsByUser');
};

const init = function () {
  const storageWatchlist = localStorage.getItem('watchlist');
  const storageRatings = localStorage.getItem('ratingsByUser');

  if (storageWatchlist) {
    state.watchlist = JSON.parse(storageWatchlist);
  }

  if (storageRatings) {
    state.ratingsByUser = JSON.parse(storageRatings);
  }
};
init();
