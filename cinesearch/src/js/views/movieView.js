import icons from 'url:../../img/icons.svg'; // Parcel 2
import poster from 'url:../../img/poster-empty.svg'; // Parcel 2
import View from './View';

class MovieView extends View {
  _parentElement = document.querySelector('.movie-container');
  _currentElement = this._parentElement.querySelector('.movie');
  _statusElement = this._parentElement.querySelector('.status');
  _data;

  _generateMarkup() {
    return `
        <div class="movie__poster">
          <figure >
            <img src="${
              this._data.poster === 'N/A' ? poster : this._data.poster
            }" alt="Poster" class="movie__img" />
          </figure>
          <div class="movie__buttons">
            <button class="btn btn--rectangular btn__watchlist">${
              this._data.watchlisted ? 'Watchlisted' : 'add to Watchlist'
            }</button>
              <button class="btn btn--rectangular btn__rate"> 
                <svg>
                  <use href="${icons}#icon-star${
      this._data.ratedByUser ? '-fill' : ' '
    }
                  "></use>
                </svg> 
                <div class="btn__rate--label">
                  ${this._data.ratedByUser ? this._data.ratingByUser : 'Rate'}
                </div>
                <form>
                <input type="number" class="btn__rate--input hidden" min="1" max="10">
                </form>
              </button>
          </div>
        </div>

        <div class="movie__details">
          <div class="movie__header">
            <div class="">
              <h2 class="movie__title">${this._data.title}</h2>
              <div class="">${this._data.year}</div>
              <div class="movie__info movie__info--tag">
              ${this._data.genre
                .split(', ')
                .map(el => {
                  return `
                <span>${el}</span>
                `;
                })
                .join('')}
              </div>
              <div class="movie__info">
              <div class="">
                  Runtime: ${this._data.runtime}
                </div>
                <div class="">
                  Director: ${this._data.director}
                </div>
                <div class="">
                  Writer: ${this._data.writer}
                </div>
                <div class="">
                  Stars: ${this._data.stars}
                </div>
                <div class="">
                  Language: ${this._data.language}
                </div>
                <div class="">
                  Country: ${this._data.country}
                </div>
            </div>

            </div>
          </div>

          <div class="movie__plot block">
            <h4>PLOT</h4>
            <p class="movie__plot--description">
            ${this._data.plot}
            </p>
          </div>

          <div class="movie__awards block">
            <h4>AWARDS AND RATINGS</h4>
            <p class="movie__awards movie__awards--description">
            ${
              this._data.awards === 'N/A'
                ? "This movie hasn't received any awards yet."
                : this._data.awards
            }
            </p>
            <div class="movie__ratings movie__info movie__info--tag">
              ${this._data.ratings
                .map(rating => {
                  let span = '<span>';

                  if (rating.Source.includes('Internet Movie Database')) {
                    span += `IMDB: ${rating.Value}`;
                  } else if (rating.Source.includes('Rotten')) {
                    span += `Rotten Tomatoes: ${rating.Value}`;
                  } else if (rating.Source.includes('Metacritic')) {
                    span += `Metacritic: ${rating.Value}`;
                  }

                  span += '</span>';

                  return span;
                })
                .join('')}
            </div>
          </div>
        </div>
  `;
  }

  addHandlerRender(handler) {
    // popstate used to capture changes in the URL (back/forward navigation in browser
    // and trigger actions based on updated URL params)
    ['hashchange', 'popstate', 'load'].forEach(event =>
      window.addEventListener(event, handler)
    );
  }

  addHandlerAddToWatchlist(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn__watchlist');

      if (!btn) return;

      handler();
    });
  }

  addHandlerShowRatingInput(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btnContainer = e.target.closest('.btn__rate');

      if (!btnContainer) return;

      const ratingLabel = btnContainer.querySelector('.btn__rate--label');
      const ratingInput = btnContainer.querySelector('.btn__rate--input');

      if (ratingLabel.innerText !== 'Rate') {
        handler();
        return;
      }

      if (ratingInput.classList.contains('hidden')) {
        ratingLabel.classList.add('hidden');
        ratingInput.classList.remove('hidden');
        ratingInput.value = '';
        ratingInput.focus();
      }
    });
  }

  addHandlerAddToRatings(handler) {
    const ratingForm = this._parentElement.querySelector('form');

    ratingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btnContainer = e.target.closest('.btn__rate');

      if (!btnContainer) return;

      const ratingLabel = btnContainer.querySelector('.btn__rate--label');
      const ratingInput = btnContainer.querySelector('.btn__rate--input');

      const ratingValue = parseInt(ratingInput.value, 10);
      if (ratingValue >= 1 && ratingValue <= 10) {
        ratingLabel.innerText = ratingValue;
      }

      ratingLabel.classList.remove('hidden');
      ratingInput.classList.add('hidden');

      handler(ratingValue);
    });
  }
}

export default new MovieView();
