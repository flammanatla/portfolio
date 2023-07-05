'use strict';

const startInput = document.querySelector('#start');
const endInput = document.querySelector('#finish');
const presetWeek = document.querySelector('.btn--week');
const presetMnth = document.querySelector('.btn--month');
const inputs = document.querySelectorAll('[type="date"]');
const calculateBtn = document.querySelector('.btn--calculate');
const optionsDays = document.querySelector('#options-days');
const optionsUnits = document.querySelector('#options-units');
const resultsList = document.querySelector('.history');

document.addEventListener('DOMContentLoaded', loadHistory);
calculateBtn.addEventListener('click', displayResult);

//block out dates in date pickers when one of the dates already selected
startInput.addEventListener('change', function () {
  presetWeek.disabled = false;
  presetMnth.disabled = false;
  endInput.setAttribute('min', startInput.value);
});

endInput.addEventListener('change', function () {
  startInput.setAttribute('max', endInput.value);
});

// disable Calculate button untill all inputs are filled
calculateBtn.disabled = true;

for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('input', () => {
    let values = [];
    inputs.forEach(v => values.push(v.value));
    calculateBtn.disabled = values.includes('');
  });
}

function displayResult() {
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);
  const units = checkUnits();
  const daysIncluded = checkDaysToInclude();
  const resultHTML = document.querySelector('.result');

  const difference = calculateDifference(
    daysIncluded,
    units,
    startDate,
    endDate
  );

  resultHTML.innerHTML = `Between ${startInput.value} and ${endInput.value} there are ${difference} ${units} (${daysIncluded})`;

  if (resultsList.childElementCount > 9) {
    resultsList.removeChild(resultsList.firstElementChild);
  }

  addNewRow(startInput.value, endInput.value, daysIncluded, units, difference);

  storeResultInLocalStorage(
    startInput.value,
    endInput.value,
    daysIncluded,
    units,
    difference
  );
}

function calculateDifference(
  includedDays = 'every day',
  units = 'days',
  start,
  finish
) {
  const diffMilliseconds = finish.getTime() - start.getTime();
  let timeDifference;
  const days = diffMilliseconds / 1000 / 60 / 60 / 24;

  if (includedDays === 'every day') {
    timeDifference = calculateInSelectedUnits(days, units);
  } else {
    const specificDays = calculateSpecificDays(start, days, includedDays);
    timeDifference = calculateInSelectedUnits(specificDays, units);
  }

  return timeDifference;
}

function calculateInSelectedUnits(days, units) {
  if (units === 'seconds') {
    return days * 24 * 60 * 60;
  } else if (units === 'minutes') {
    return days * 24 * 60;
  } else if (units === 'hours') {
    return days * 24;
  } else if (units === 'days') {
    return days;
  }
}

function calculateSpecificDays(start, time, daysToInclude) {
  const week = [0, 0];

  for (let i = 0; i < time; i++) {
    start.setDate(start.getDate() + 1);
    let currentDayOfTheWeek = start.getDay();
    if (currentDayOfTheWeek > 0 && currentDayOfTheWeek < 6) {
      week[0]++;
    } else {
      week[1]++;
    }
  }

  if (daysToInclude === 'weekdays') {
    return week[0];
  } else if (daysToInclude === 'weekends') {
    return week[1];
  }
}

function checkDaysToInclude() {
  const daysToInclude = document.getElementsByName('daysToInclude');

  for (let i = 0; i < daysToInclude.length; i++) {
    if (daysToInclude[i].checked) {
      //console.log(`days to include --->`, daysToInclude[i].value);
      return daysToInclude[i].value;
    }
  }
}

function checkUnits() {
  const unit = document.getElementsByName('unit');

  for (let i = 0; i < unit.length; i++) {
    if (unit[i].checked) {
      //console.log(`selected unit --->`, unit[i].value);
      return unit[i].value;
    }
  }
}

function updateEndDate(preset) {
  const startDate = new Date(startInput.value);
  let endDate = startDate;

  endDate = new Date(
    endDate.setDate(endDate.getDate() + (preset === 'week' ? 7 : 28))
  );

  endInput.value =
    endDate.getFullYear() +
    '-' +
    Number(endDate.getMonth() + 1)
      .toString()
      .padStart(2, '0') +
    '-' +
    Number(endDate.getDate()).toString().padStart(2, '0');

  // create input event to trigger eventListener on endInput date picker
  const changeEvent = new Event('input');
  endInput.dispatchEvent(changeEvent);
}

function storeResultInLocalStorage(start, end, daysIncluded, units, result) {
  let history;
  if (localStorage.getItem('history') !== null) {
    history = JSON.parse(localStorage.getItem('history'));
  } else {
    history = [];
  }

  if (history.length > 9) {
    history.shift();
  }
  history.push({ start, end, daysIncluded, units, result });
  localStorage.setItem('history', JSON.stringify(history));
}

function loadHistory() {
  let history;

  if (localStorage.getItem('history') !== null) {
    history = JSON.parse(localStorage.getItem('history'));
  } else {
    history = [];
  }

  //console.log('loading history...');

  history.forEach(element => {
    addNewRow(
      element.start,
      element.end,
      element.daysIncluded,
      element.units,
      element.result
    );
  });
}

function addNewRow(start, end, daysIncluded, units, difference) {
  const tr = document.createElement('tr');
  const date1 = document.createElement('td');
  const date2 = document.createElement('td');
  const daysIncl = document.createElement('td');
  const unit = document.createElement('td');
  const result = document.createElement('td');

  date1.innerHTML = start;
  date2.innerHTML = end;
  daysIncl.innerHTML = daysIncluded;
  unit.innerHTML = units;
  result.innerHTML = difference;

  tr.appendChild(date1);
  tr.appendChild(date2);
  tr.appendChild(daysIncl);
  tr.appendChild(unit);
  tr.appendChild(result);

  resultsList.appendChild(tr);
}
