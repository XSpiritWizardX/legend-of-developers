// frontend/src/store/csrf.js

import Cookies from 'js-cookie';


export async function csrfFetch(url, options = {}) {
  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there are no headers
  options.headers = options.headers || {};
  const isFormData = options.body instanceof FormData;
  // include credentials to ensure cookies are sent with every request
  options.credentials = 'include';

  // if the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json", and set the "XSRF-TOKEN" header to the value of the
  // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    if (!isFormData) {
      options.headers['Content-Type'] =
        options.headers['Content-Type'] || 'application/json';
    }
    options.headers['X-CSRFToken'] = Cookies.get('csrf_token');
  }
  // call the default window's fetch with the url and the options passed in
  const res = await window.fetch(url, options);

  // if the response status code is 400 or above, then throw an error with the
  // error being the response
  if (res.status >= 400) throw res;

  // if the response status code is under 400, then return the response to the
  // next promise chain
  return res;
}



// call this to get the "XSRF-TOKEN" cookie, should only be used in development
// ensure that restoreCSRF() is called when your application initializes.
// typically, this is done in the main entry file (like index.js or main.jsx) before rendering the React application
export function restoreCSRF() {

    return csrfFetch('/api/csrf/restore');
  }
