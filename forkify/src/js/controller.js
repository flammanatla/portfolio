import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import { MODAL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // Get recipeId from the address bar
    const id = window.location.hash.slice(1);

    if (!id) return;

    // Rendering spinner while waiting for the recipe
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Update bookmarks view to mark selected recipe on bookmark panel
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  resultsView.renderSpinner();

  // get search query
  const query = searchView.getQuery();
  if (!query) return;

  // load search results
  await model.loadSearchResults(query);

  // render results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage());

  // render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlPagination = function (goToPage) {
  // render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // Upd the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.removeBookmark(model.state.recipe.id);
  }

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlRemoveRecipe = async function () {
  const id = window.location.hash.slice(1);
  console.log(JSON.stringify(model.state.recipe));

  // remove recipe from server
  await model.removeRecipe(id);

  // remove bookmark from the model and update bookmarks panel
  if (model.state.recipe.bookmarked) {
    model.removeBookmark(model.state.recipe.id);
    bookmarksView.render(model.state.bookmarks);
  }

  window.location = '/';
};

const controlIngredients = function (
  inputField,
  value,
  ingredientNumber,
  validationCache
) {
  let isUploadButtonDisabled = false;
  let validationState;

  if (value === '') {
    validationCache[ingredientNumber] = true;
    validationState = 'Empty';
  } else {
    const isValid = model.validateIngredient(value);
    validationCache[ingredientNumber] = isValid;
    validationState = isValid ? 'Valid' : 'NotValid';
  }

  console.log(validationCache);
  if (validationCache.filter(element => element === false).length > 0) {
    isUploadButtonDisabled = true;
  } else {
    isUploadButtonDisabled = false;
  }

  addRecipeView.renderValidation(
    inputField,
    validationState,
    isUploadButtonDisabled
  );
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderStatus('success');

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close modal form
    setTimeout(function () {
      addRecipeView.toggleWindow();
      addRecipeView.setFormVisibility(true);
      addRecipeView.setStatusVisibility(false);
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderStatus('fail', err.message);

    addRecipeView.setFormVisibility(false);
    addRecipeView.setStatusVisibility(true);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerRemoveRecipe(controlRemoveRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  addRecipeView.addHandlerValidate(controlIngredients);
};
init();
