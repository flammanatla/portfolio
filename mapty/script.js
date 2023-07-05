'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // for the sake of having public method :)
  click() {
    this.clicks++;
    console.log(this.id, this.clicks);
  }

  static fromJSON(workoutJSON) {
    if (workoutJSON.type === 'running') {
      return Object.assign(new Running(), workoutJSON);
    } else if (workoutJSON.type === 'cycling') {
      return Object.assign(new Cycling(), workoutJSON);
    }
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = (this.distance / this.duration) * 60;
  }
}

///////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteSelectedWorkouts = document.querySelector('.workouts__delete');

class App {
  #map;
  #mapZoomLvl = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    // get user's position
    this.#getPosition();

    //get data from the local storage
    this.#getLocalStorage();

    // submit the form
    form.addEventListener('submit', this.#newWorkout.bind(this));

    // toggle the input fields based on the workout type
    inputType.addEventListener('change', this.#toggleElevationField);

    // move to the selected workout on the map
    containerWorkouts.addEventListener('click', this.#moveToPopup.bind(this));

    deleteSelectedWorkouts.addEventListener(
      'click',
      this.#deleteSelectedWorkouts.bind(this)
    );
  }

  #getPosition() {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        this.#loadDefaultPosition.bind(this)
      );
    }
  }

  #loadDefaultPosition() {
    //alert('Could not get your position, using London as a default :)');
    this.#loadMap.bind(this)({
      coords: {
        latitude: 51.5287393,
        longitude: -0.0735502,
      },
    });
  }

  #loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLvl);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling clicks on map
    this.#map.on('click', this.#showForm.bind(this));

    // add saved workouts on the map
    this.#workouts.forEach(workout => {
      this.#renderWorkoutMarker(workout);
    });
  }

  #showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  #hideForm() {
    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  #toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  #newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    const allPositive = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // if workout == running, create running obj
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Input has to be positive numbers');
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout == cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Input has to be positive numbers');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add the new obj to workout array
    this.#workouts.push(workout);

    // render new workout on the map
    this.#renderWorkoutMarker(workout);

    // render new workout on the list
    this.#renderWorkoutOnList(workout);

    //clear input fields
    this.#hideForm();

    // Save workouts in local storage
    this.#setLocalStorage();
  }

  // display marker on the map
  #renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}
      `
      )
      .openPopup();
  }

  #renderWorkoutOnList(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <div class="workout__title">
          <input type="checkbox" class="workout__select">
          <h2>${workout.description}</h2>
        </div>
        <div class="workout__edit">
          <i class="far fa-edit fa-2x"></i>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);

    // get checkbox for selecting workouts
    const selectedWorkouts = document
      .querySelector('.workouts > li')
      .querySelector('.workout__select');

    const editWorkout = document
      .querySelector('.workouts > li')
      .querySelector('.workout__edit');

    // show "delete selected workouts" button
    selectedWorkouts.addEventListener('click', this.#showDeleteButton);

    editWorkout.addEventListener('click', this.#updateWorkout.bind(this));
  }

  #moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLvl, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public API of the Workout class
    workout.click();
  }

  #setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  #getLocalStorage() {
    const restoredWorkouts = JSON.parse(localStorage.getItem('workouts'));

    if (!restoredWorkouts) return;

    this.#workouts = restoredWorkouts.map(workout => {
      return Workout.fromJSON(workout);
    });

    console.log(this.#workouts);

    this.#workouts.forEach(workout => {
      this.#renderWorkoutOnList(workout);
      // then we need to add workouts on the map, but we do it later in the #loadMap() method.
      // Because we cannot add markers to the map before map loads
    });
  }

  #showDeleteButton() {
    deleteSelectedWorkouts.classList.remove('hidden');
  }

  #deleteSelectedWorkouts() {
    const allSelectedWorkouts = document.querySelectorAll(
      '.workout__select:checked'
    );
    allSelectedWorkouts.forEach(workout => {
      const workoutEl = workout.parentNode.parentNode;

      // filter out selected workout
      const remainingWorkouts = this.#workouts.filter(
        workout => workout.id !== workoutEl.dataset.id
      );
      this.#workouts = remainingWorkouts;
      workoutEl.remove();
    });

    // re-save workouts in local storage
    this.#setLocalStorage();
    deleteSelectedWorkouts.classList.add('hidden');
  }

  #updateWorkout(e) {
    const iconContainer = e.target.parentElement;
    const workoutItem = iconContainer.parentElement;
    const workoutTitleAsHTMLElement = workoutItem
      .querySelector('.workout__title')
      .querySelector('h2');
    const workoutId = workoutItem.dataset.id;

    workoutTitleAsHTMLElement.textContent =
      prompt('Edit workout title', workoutTitleAsHTMLElement.textContent) ||
      workoutTitleAsHTMLElement.textContent;

    console.log('updating workout in local storage');

    const objectIndex = this.#workouts.findIndex(
      object => object.id === workoutId
    );
    this.#workouts[objectIndex].description =
      workoutTitleAsHTMLElement.textContent;
    this.#setLocalStorage();
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
