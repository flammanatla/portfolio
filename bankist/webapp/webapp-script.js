'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Natalka Moroz',
  transactions: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  transactionsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-05-18T17:01:17.194Z',
    '2023-05-19T23:36:17.929Z',
    '2023-05-22T10:51:36.790Z',
  ],
  currency: 'GBP',
  locale: 'en-GB', // de-DE
};

const account2 = {
  owner: 'Jonas Schmedtmann',
  transactions: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  transactionsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const btnLogin = document.querySelector('.login__btn');
const btnLoginPopup = document.querySelector('.btn__popup--login');
const btnLogout = document.querySelector('.btn--logout');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const containerApp = document.querySelector('.app');
const containerTransactions = document.querySelector('.movements');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const modal = document.querySelector('.modal');

const overlay = document.querySelector('.overlay');

const dateConstructor = (date, locale) => {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
};

const calcDaysPassed = (date, todayDate, locale) => {
  const days = Math.round(Math.abs(todayDate - date) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days <= 7) return `${days} days ago`;
  else return dateConstructor(date, locale);
};

const formatCurrency = (value, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);

const displayTransactions = function (account, sort = false) {
  containerTransactions.innerHTML = '';

  const transactions = sort
    ? account.transactions.slice().sort((a, b) => a - b)
    : account.transactions;

  transactions.forEach(function (transaction, i) {
    const transactionType = transaction > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.transactionsDates[i]);
    const displayDate = calcDaysPassed(date, new Date(), account.locale);

    const hasBackgroundColor = i % 2 === 0;

    const html = `
      <div class="movements__row" style="${
        hasBackgroundColor ? 'background-color: lightgrey' : ''
      }">
          <div class="movements__type movements__type--${transactionType}">${
      i + 1
    } ${transactionType}</div>
    <div class="movements__date">${displayDate}</div>

          <div class="movements__value">${formatCurrency(
            transaction,
            account.locale,
            account.currency
          )}</div>
        </div>
    `;

    containerTransactions.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplaySummary = function (account) {
  const incomes = account.transactions
    .filter(transaction => transaction > 0)
    .reduce((accumulator, transaction) => (accumulator += transaction), 0);
  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );

  const spendings = account.transactions
    .filter(transaction => transaction < 0)
    .reduce((accumulator, transaction) => (accumulator += transaction), 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(spendings),
    account.locale,
    account.currency
  );

  const interest = account.transactions
    .filter(transaction => transaction > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .reduce((accumulator, interest) => (accumulator += interest), 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const createUserNames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(user => user[0])
      .join('');
  });
};

createUserNames(accounts);

const calcDisplayBalance = function (account) {
  account.balance = account.transactions.reduce(
    (accumulator, transaction) => (accumulator += transaction),
    0
  );

  labelBalance.textContent = `${formatCurrency(
    account.balance,
    account.locale,
    account.currency
  )}`;
};

const updateUI = function (account) {
  displayTransactions(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

const rearrangeUI = activity => {
  if (activity === 'login') {
    modal.classList.add('hidden');
    labelWelcome.classList.remove('hidden');
    overlay.classList.add('hidden');
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
  } else if (activity === 'logout') {
    //labelWelcome.textContent = `Login to get started`;
    modal.classList.remove('hidden');
    labelWelcome.classList.add('hidden');
    overlay.classList.remove('hidden');
    containerApp.style.opacity = 0;
  }
};

const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(remainingTime / 60)).padStart(2, 0);
    const sec = String(remainingTime % 60).padStart(2, 0);

    //print the remaining time in UI
    labelTimer.textContent = `${min}:${sec}`;

    // when 0 seconds left logout user
    if (remainingTime === 0) {
      clearInterval(timer);
      rearrangeUI('logout');
    }

    remainingTime--;
  };

  // set timer to 5 minutes
  let remainingTime = 60;

  tick();
  // call the timer every second
  const timer = setInterval(tick, 1000);

  return timer;
};

//Event handlers
let currentAccount, timer;

const login = function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    rearrangeUI('login');

    const displayClock = () => {
      const now = new Date();
      labelDate.textContent = dateConstructor(now, currentAccount.locale);
    };

    // display clock immediately after login
    displayClock();

    // update clock every minute
    setInterval(() => {
      displayClock();
    }, 60000);

    //inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }
};

// btnLogin.addEventListener('click', login);
btnLoginPopup.addEventListener('click', login);
btnLogout.addEventListener('click', function () {
  rearrangeUI('logout');
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    account => account.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    currentAccount.transactions.push(-amount);
    receiverAcc.transactions.push(amount);

    currentAccount.transactionsDates.push(new Date().toISOString());
    receiverAcc.transactionsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    console.log('Transfer arrived');

    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    alert(`Transfer is not valid`);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.transactions.some(transaction => transaction >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.transactions.push(amount);

      currentAccount.transactionsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      console.log('Loan is approved');

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  } else {
    alert(`Loan amount is too big`);
  }
  inputLoanAmount.value = '';
});

let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayTransactions(currentAccount, !isSorted);
  isSorted = !isSorted;
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.pin === Number(inputClosePin.value) &&
    currentAccount.username === inputCloseUsername.value
  ) {
    console.log('acc is deleted');

    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);

    // Hide UI ("log out")
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
