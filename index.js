import { readFile, writeFile } from 'fs/promises';

const getDeepKeys = (obj) => {
  let keys = [];

  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      const subkeys = getDeepKeys(obj[key]);
      keys = keys.concat(subkeys.map((subkey) => key + '.' + subkey));
    } else {
      keys.push(key);
    }
  }

  return keys;
};

const getUniqueHeaders = (arrayObj) => {
  const headers = arrayObj.map((obj) => getDeepKeys(obj));
  return [...new Set(headers.flat())];
};

const getNestedValue = (obj, key) => {
  return key
    .split('.')
    .reduce(
      (result, key) => (result.hasOwnProperty(key) ? result[key] : ''),
      obj,
    );
};

const covertObjectToCSV = (arrayObj) => {
  const headers = getUniqueHeaders(arrayObj);
  const data = arrayObj.reduce((currentData, currentVal) => {
    currentData.push(
      headers.reduce((value, key) => {
        value.push(getNestedValue(currentVal, key));
        return value;
      }, []),
    );
    return currentData;
  }, []);

  return `${headers.join(',')} \n ${data.join('\n')}`;
};

(async () => {
  try {
    const content = await readFile(new URL('./products.json', import.meta.url));
    const arrayData = JSON.parse(content);

    const data = covertObjectToCSV(arrayData);

    await writeFile('data.csv', data, (err) => {
      if (err) {
        console.error(err);
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
