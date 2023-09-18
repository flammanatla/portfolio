import icons from 'url:../../img/icons.svg'; // Parcel 2
import poster from 'url:../../img/poster-empty.svg'; // Parcel 2
import View from './View';

class MovieView extends View {
  _parentElement = document.querySelector('.movie-container');
  _movieElement = this._parentElement.querySelector('.movie');
  _statusElement = this._parentElement.querySelector('.status');
  _data;

  render(data) {
    this._data = data;

    this.setStatusVisibility(false);
    this.setMovieVisibility(true);

    this._movieElement.innerHTML = '';
    this._movieElement.innerHTML = this.#generateMarkup();
  }

  setStatusVisibility(flag) {
    flag
      ? this._statusElement.classList.remove('hidden')
      : this._statusElement.classList.add('hidden');
  }

  setMovieVisibility(flag) {
    flag
      ? this._movieElement.classList.remove('hidden')
      : this._movieElement.classList.add('hidden');
  }

  #generateMarkup() {
    return `
      <div class="movie__poster">
        <figure >
          <img src="${
            this._data.poster === 'N/A' ? poster : this._data.poster
          }" alt="Poster" class="movie__img" />
        </figure>
        <div class="movie__buttons">
          <button class="btn btn--rectangular btn__watchlist">add to Watchlist</button>
          <button class="btn btn--rectangular btn__rate"> 
            <svg>
              <use href="${icons}#icon-star"></use>
            </svg>
            Rate
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
                Director: ${this._data.director}
              </div>
              <div class="">
                Stars: ${this._data.stars}
              </div>
              <div class="">
                Language: ${this._data.language}
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
          ${(this._data.awards = 'N/A'
            ? "This movie hasn't received any awards yet."
            : this._data.awards)}
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
    ['hashchange', 'load'].forEach(event =>
      window.addEventListener(event, handler)
    );
  }
}

export default new MovieView();
