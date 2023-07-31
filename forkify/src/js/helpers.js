import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  const fetchData = uploadData
    ? fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      })
    : fetch(url);

  const response = await Promise.race([fetchData, timeout(TIMEOUT_SEC)]);
  const data = await response.json();

  if (!response.ok)
    throw new Error(
      `${data.message} (${response.status} ${response.statusText})`
    );

  return data;
};

/*
export const getJSON = async function (url) {
  //try {
  const response = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
  const data = await response.json();

  if (!response.ok)
    throw new Error(
      `${data.message} (${response.status} ${response.statusText})`
    );

  return data;
  // if we do not do anything else with err (such as showing it in console.log or modifying somehow,
  // try/catch block is not needed here).
  // } catch (err) {
  //   throw err;
  // }
};

export const sendJSON = async function (url, uploadData) {
  //try {
  const fetchData = fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(uploadData),
  });

  const response = await Promise.race([fetchData, timeout(TIMEOUT_SEC)]);
  const data = await response.json();

  if (!response.ok)
    throw new Error(
      `${data.message} (${response.status} ${response.statusText})`
    );

  return data;
  // if we do not do anything else with err (such as showing it in console.log or modifying somehow,
  // try/catch block is not needed here).
  // } catch (err) {
  //   throw err;
  // }
};
*/
