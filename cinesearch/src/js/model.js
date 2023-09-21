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
  bookmarks: [],
};

const createMovieObject = function (data) {
  return {
    imdbID: data.imdbID,
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

  console.log(state.movie);
};

export const loadSearchResults = async function (query, page = 1) {
  state.search.query = query;
  const data = await AJAX(
    `${API_URL}?s=${query}&apikey=${API_KEY}&page=${page}`
  );

  console.log(data, query);

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

  console.log(state.search);
};

export const getSearchResultsPage = async function (page = state.search.page) {
  state.search.page = page;
  // const start = (page - 1) * state.search.resultsPerPage;
  // const end = page * state.search.resultsPerPage;
  // return state.search.currentPageResults.slice(start, end);
  if (state.search.query) {
    await loadSearchResults(state.search.query, page);
  }
  return state.search.currentPageResults;
};
