var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


export function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      console.log(url);

      let xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              console.log(jsonResponse);
              let jsonResponse = JSON.parse(xhr.responseText);
              resolve({ data: jsonResponse });
            } catch (error) {
              reject({ status: xhr.status, statusText: "Invalid JSON response" });
            }
          } else {
            reject({ status: xhr.status, statusText: xhr.statusText});
          }
        }
      }

      xhr.oneerror = function () {
        reject({ status: xhr.status, statusText: "Network Error" });
      }

      xhr.send();
  });
}

export default fetchModel;
