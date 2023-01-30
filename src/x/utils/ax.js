/**
 * ax is a wrapper around an axios instance,
 * preconfigured to have a base URL and auth headers
 * to interact with Laravel API
 */

import axios from 'axios';
import { Notify } from 'quasar'

let token;

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function errorMsg(prefix, error) {

  let msg = '';

  if (error?.response) {
    msg = prefix + ' Report to admin. Status: ' + error?.response?.status + '. ' + error?.message
  } else if (error?.request) {
    // Something happened in setting up the request that triggered an Error
    msg = prefix + ' Could not send request. Check CORS settings.<br /> Status: ' + error?.response?.status + '. ' + error?.message
  } else {
    msg = prefix + ' Error: ' + (error?.message ?? 'unknown')
  }

  return msg;
}

export function notify(type, msg) {
  Notify.create({
    type: type,
    message: msg,
    html: true,
    timeout: 0,
    actions: [{
      icon: 'close',
      color: 'white',
      handler: () => {
      },
    },
    ],
  });
}

function getToken() {

  // get the XSRF-TOKEN from laravel
  const token = getCookie('XSRF-TOKEN');

  // request it only if not already requested.
  if (token != null) {
    return new Promise(resolve => resolve(token));
  } else {
    return axios.get(process.env.BASE_URL + '/sanctum/csrf-cookie', {
      withCredentials: true
    }).catch(function (error) {
      notify('negative', errorMsg('Could not set auth cookie.', error));
    });
  }
}

export const ax = axios.create({
  baseURL: process.env.BASE_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const baseUrl = process.env.BASE_URL;

export const apiPath = path => {
  return process.env.BASE_URL + '/' + import.meta.env.APP_URL_api + '/' + path.replace(/^\//g, '');
}

/**
 * Set token for authentication with Laravel Backend API
 */
ax.interceptors.request.use(function (config) {

  token = getToken();

  return token.then(token => {

    console.log('xsrf-token', token);

    if (!token) {
      // there is no token
      notify('negative', 'Could not get XSRF-TOKEN. Check SSL certificate, accept it and reload the page.')
      // cancel futher requests
      return false;
    }

    // set headers for ajax requests
    config.headers['X-XSRF-TOKEN'] = getCookie('XSRF-TOKEN');

    return config;
  });

}, error => {
  notify('negative', errorMsg('Request Error: ', error));
  return Promise.reject(error)
});

/**
 * Catch response errors
 */
ax.interceptors.response.use(response => response, error => {
  notify('negative', errorMsg('Response error: ', error))
  return Promise.reject(error)
});

export function get(url, ...args) {
  return ax.get(apiPath(url), ...args);
}

export function post(url, ...args) {
  return ax.post(apiPath(url), ...args);
}

export async function initialState(to, next) {
  const r = await get(to.fullPath);
  to.meta.data = r.data
  next()
}

function cleanRoute(url) {
  return url.replace(process.env.BASE_URL, '') || '/';
}

export async function redirect(router, url) {
  return await router.push(cleanRoute(url));
}
