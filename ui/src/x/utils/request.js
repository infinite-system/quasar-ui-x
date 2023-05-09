/**
 * Request is a wrapper (currently) around an axios instance,
 * It is preconfigured to have a base URL and auth headers
 * to interact with Laravel API
 */

import axios from 'axios';
import { Notify } from 'quasar'
import router from '@/router';



let token;

export function getCookie (name) {
  // console.log('allcookies', document.cookie)
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function getTokenCookie () {
  const token = getCookie('XSRF-TOKEN')
  if (token == null) return token;
  return String(token).replace('%3D', '=')
}

export function errorMsg (prefix, error) {

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

export function notify (type, msg) {
  Notify.create({
    type: type,
    message: msg,
    html: true,
    timeout: 0,
    actions: [{
      icon: 'close',
      color: 'white',
      handler: () => {},
    }],
  });
}

function getToken () {

  // get the XSRF-TOKEN from laravel
  const token = getTokenCookie()

  console.log('token', token)

  // request it only if not already requested.
  if (token != null) {
    return new Promise(resolve => resolve(token));
  } else {
    // the following must the native axios instance, not axios
    // otherwise it will create circular loop
    return axios.get(process.env.BASE_URL + '/sanctum/csrf-cookie', {
      withCredentials: true,
    }).catch(function(error) {
      notify('negative', errorMsg('Could not set auth cookie.', error));
    });
  }
}

export const request = axios.create({
  baseURL: process.env.BASE_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
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
request.interceptors.request.use(function(config) {

  token = getToken();

  return token.then(token => {

    // console.log('xsrf-token', token);

    if (!token) {
      // there is no token
      notify('negative', 'Could not get XSRF-TOKEN. Check SSL certificate, accept it and reload the page.')
      // cancel futher requests
      return false;
    }

    console.log('getTokenCookie()', getTokenCookie())
    // set headers for ajax requests
    config.headers['X-XSRF-TOKEN'] = getTokenCookie()

    return config;
  });

}, error => {
  notify('negative', errorMsg('Request Error: ', error));
  return Promise.reject(error)
});

/**
 * Catch response errors
 */
request.interceptors.response.use(response => response, error => {

  if ('response' in error
    && 'data' in error.response
    && 'errors' in error.response.data
    && 'message' in error.response.data.errors
    && error.response.data.errors.message === "Unauthenticated."
    && 'status_code' in error.response.data.errors
    && error.response.data.errors.status_code === 500
  ) {
    setTimeout(() => {
      window.location.href = router().resolve({ name: 'login', params: { locale: 'en-ca'}, query: { you_ve_been_logged_out: 1} }).href;
    }, 3500)
    notify('negative', 'You have been logged out. Redirecting to login...')
  } else {
    notify('negative', errorMsg('Response error: ', error))
  }

  return Promise.reject(error)
});

export function get (url, ...args) {
  return request.get(apiPath(url), ...args);
}

export function post (url, ...args) {
  return request.post(apiPath(url), ...args);
}

export async function redirect (router, location) {
  // console.log('cleanRoute(url)', cleanRoute(url))
  return await router.push(location);
}

function cleanRoute (url) {
  return url.replace(process.env.BASE_URL, '') || '/';
}

export const api = {
  get,
  post,
  redirect
}

export async function initialState (to, next) {
  to.meta.data = {}
  console.log('load initial state....')
  try {
    const response = await get(to.fullPath, { timeout: 5000 });
    if ('data' in response) {
      to.meta.data = response.data
    }
  } catch (e) {
    console.error('Could not load initial state for: ' + to.fullPath);
  }
  next()
}
