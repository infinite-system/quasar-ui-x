import warn from './log'

export function extractQuery(element) {

  element = typeof element === 'string' ? document.querySelector(element) : element

  if (!element) return [];

  let inputs = element.querySelectorAll('input,textarea,select,button');
  let i, j, q = [];
  for (i = inputs.length - 1; i >= 0; i = i - 1) {
    if (inputs[i].name === "") {
      continue;
    }
    switch (inputs[i].nodeName) {
      case 'INPUT':
        switch (inputs[i].type) {
          case 'text':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
            break;
          case 'checkbox':
          case 'radio':
            if (inputs[i].checked) {
              q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
            }
            break;
          case 'file':
            break;
        }
        break;
      case 'TEXTAREA':
        q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
        break;
      case 'SELECT':
        switch (inputs[i].type) {
          case 'select-one':
            q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
            break;
          case 'select-multiple':
            for (j = inputs[i].options.length - 1; j >= 0; j = j - 1) {
              if (inputs[i].options[j].selected) {
                q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].options[j].value));
              }
            }
            break;
        }
        break;
      case 'BUTTON':
        switch (inputs[i].type) {
          case 'reset':
          case 'submit':
          case 'button':
            q.push(inputs[i].name + "=" + encodeURIComponent(inputs[i].value));
            break;
        }
        break;
    }
  }
  return q.join("&");
}

export function extractData(element, selectors = 'input,textarea,select,button') {

  element = typeof element === 'string' ? document.querySelector(element) : element

  if (!element) {
    warn(element, 'is not a valid element to extractData(); Returning empty object {}')
    return {};
  }

  let inputs = element.querySelectorAll(selectors);

  let i, j, q = {};
  for (i = inputs.length - 1; i >= 0; i = i - 1) {

    if (inputs[i].name === "") {
      continue
    }

    switch (inputs[i].nodeName) {
      case 'INPUT':
        switch (inputs[i].type) {
          case 'text':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            q[inputs[i].name] = inputs[i].value
            break;
          case 'checkbox':
          case 'radio':
            if (inputs[i].checked) {
              // if (typeof q[inputs[i].name] !== 'undefined'){
              //   q[inputs[i].name] =
              // }
              q[inputs[i].name] = inputs[i].value
            }
            break;
          case 'file':
            break;
        }
        break;
      case 'TEXTAREA':
        q[inputs[i].name] = inputs[i].value
        break;
      case 'SELECT':
        switch (inputs[i].type) {
          case 'select-one':
            q[inputs[i].name] = inputs[i].value
            break;
          case 'select-multiple':
            for (j = inputs[i].options.length - 1; j >= 0; j = j - 1) {
              if (inputs[i].options[j].selected) {
                q[inputs[i].name] = inputs[i].options[j].value
              }
            }
            break;
        }
        break;
      case 'BUTTON':
        switch (inputs[i].type) {
          case 'reset':
          case 'submit':
          case 'button':
            q[inputs[i].name] = inputs[i].value
            break;
        }
        break;
    }
  }
  return q;
}
