import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url) {
  const fetchData = fetch(url);

  const response = await Promise.race([fetchData, timeout(TIMEOUT_SEC)]);

  let data;

  try {
    data = await response.json();
  } catch (_) {
    throw new Error(`(${response.status} ${response.statusText})`);
  }

  if (!response.ok) {
    throw new Error(
      `${data.message} (${response.status} ${response.statusText})`
    );
  }

  if (data.Response == 'False') {
    throw new Error(data.Error);
  }

  return data;
};
