'use strict';

const form = document.querySelector('.top-banner form');
const input = document.querySelector('.top-banner input');
const list = document.querySelector('.response-section .cities');

const apiKey = '71b88dd3f450be928f50470ac26c6840';

form.addEventListener('submit', e => {
  e.preventDefault();

  let inputVal = input.value;

  const listItems = list.querySelectorAll('.response-section .city');
  const listItemsArray = Array.from(listItems);

  if (listItemsArray.length > 0) {
    const duplicate = listItemsArray.find(element => {
      if (inputVal.includes(',')) {
        if (inputVal.split(',')[1].length > 2) {
          inputVal = inputVal.split(',')[0];
          const content = element
            .querySelector('.city-name span')
            .textContent.toLowercase();
          return inputVal === content;
        } else {
          const cityData = element
            .querySelector('.city-name')
            .dataset.name.toLowercase();
          return inputVal.toLowercase() === cityData;
        }
      } else {
        const cityName = element
          .querySelector('.city-name span')
          .textContent.toLowercase();
        return inputVal.toLowercase() === cityName;
      }
    });

    if (duplicate) {
      msg.textContent = `You already have card for ${inputVal}`;
      form.reset();
      input.focus();
      return;
    }
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const { main, name, sys, weather } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]['icon']}.svg`;

      const li = document.createElement('li');
      li.classList.add('city');
      const markup = `
      <h2 class="city-name" data-name="${name},${sys.country}">
        <span>${name}</span>
        <sup>${sys.country}</sup>
      </h2>
      <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
      <figure>
        <img class="city-icon" src="${icon}" alt="${weather[0]['description']}">
        <figcaption>${weather[0]['description']}</figcaption>
      </figure>
    `;

      li.innerHTML = markup;
      list.appendChild(li);
    })
    .catch(() => {
      msg.textContent = 'Please search for a valid city';
    });

  form.reset();
  input.focus();

  msg.textContent = '';
});
