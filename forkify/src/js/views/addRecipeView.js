import View from './View.js';
import icons from 'url:../../img/icons.svg';
import { VALIDATION_DELAY_SEC } from '../config.js';

class addRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _statusElement = this._parentElement.nextElementSibling;
  _msg = `Recipe successfully uploaded!`;

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this.#addHandlerShowWindow();
    this.#addHandlerHideWindow();
  }

  #addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  toggleWindow() {
    if (this._overlay.classList.contains('hidden')) {
      this.setFormVisibility(true);
      this.setStatusVisibility(false);

      this.resetForm();
    }

    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  resetForm() {
    this._parentElement.reset();

    this._parentElement.querySelectorAll('.toValidate').forEach(element => {
      element.nextElementSibling.innerHTML = '';
      element.style.border = '1px solid #ddd';
    });
  }

  #addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerValidate(handler) {
    const validationCache = Array.from({ length: 6 });

    this._parentElement
      .querySelectorAll('.toValidate')
      .forEach((field, index) => {
        let validationTimer;

        field.addEventListener('input', e => {
          clearTimeout(validationTimer);

          validationTimer = setTimeout(() => {
            handler(e.target, e.target.value, index, validationCache);
          }, VALIDATION_DELAY_SEC * 1000);
        });
      });
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataArray = [...new FormData(this)];
      const data = Object.fromEntries(dataArray);
      handler(data);
    });
  }

  renderValidation(inputField, validationState, isUploadButtonDisabled) {
    const uploadBtn = this._parentElement.querySelector('.upload__btn');

    if (isUploadButtonDisabled) {
      uploadBtn.setAttribute('disabled', '');
    } else {
      uploadBtn.removeAttribute('disabled');
    }

    if (validationState === 'Valid') {
      inputField.nextElementSibling.innerHTML =
        '<i class="fa-regular fa-circle-check fa-xl" style="color: #2b9d0b"></i>';
      inputField.style.border = '2px solid green';
    } else if (validationState === 'NotValid') {
      inputField.nextElementSibling.innerHTML =
        '<i class="fa-regular fa-circle-xmark fa-xl" style="color: #f38e82"></i>';
      inputField.style.border = '2px solid #f38e82';
    } else if (validationState === 'Empty') {
      inputField.nextElementSibling.innerHTML = '';
      inputField.style.border = '1px solid #ddd';
    }
  }

  renderStatus(type, message) {
    const markupSuccess = `
      <div>
        <svg>
          <use href="${icons}.svg#icon-smile"></use>
        </svg>
      </div>
      <p>${message || this._msg}</p>
    `;

    const markupFail = `
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message || this._errorMsg}</p>
    `;

    if (type === 'success') {
      // this._statusElement.insertAdjacentHTML('afterbegin', markupSuccess);
      this._statusElement.innerHTML = markupSuccess;
    }

    if (type === 'fail') {
      // this._statusElement.insertAdjacentHTML('afterbegin', markupFail);
      this._statusElement.innerHTML = markupFail;
    }

    this.setFormVisibility(false);
    this.setStatusVisibility(true);
  }

  setFormVisibility(flag) {
    flag
      ? this._parentElement.classList.remove('remove')
      : this._parentElement.classList.add('remove');
  }

  setStatusVisibility(flag) {
    flag
      ? this._statusElement.classList.remove('remove')
      : this._statusElement.classList.add('remove');
  }

  _generateMarkup() {}
}

export default new addRecipeView();
