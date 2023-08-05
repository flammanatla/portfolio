import View from './View.js';
import { VALIDATION_DELAY_SEC } from '../config.js';

class addRecipeView extends View {
  _parentElement = document.querySelector('.upload');
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
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');

    // hide status
    // show form
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

  _generateMarkup() {}
}

export default new addRecipeView();
