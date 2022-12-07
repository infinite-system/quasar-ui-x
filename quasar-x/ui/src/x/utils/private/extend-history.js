let lastPosition, prevPosition

export function extendHistory () {

  // For youtube music like seemless routing
  // adopted from here: https://stackoverflow.com/a/25673911/1502706
  const extendEvent = function(type) {
    const orig = history[type];
    return function() {
      const rv = orig.apply(this, arguments);
      const e = new Event('x_' + type);
      e.arguments = arguments;
      window.dispatchEvent(e);
      return rv;
    }
  }

  history.pushState = extendEvent('pushState')
  history.replaceState = extendEvent('replaceState');

  window.addEventListener('x_replaceState', function(e) {
    xHistory.isInitialLoad = true
    xHistory.lastPosition = e.arguments[0].position
  });

  window.addEventListener('x_pushState', function(e) {
    xHistory.isInitialLoad = false
    xHistory.lastPosition = e.arguments[0].position
  });


// CustomEvent
//   (function() {
//     if (typeof window.CustomEvent === "function") return false;
//
//     function CustomEvent (event, params) {
//       params = params || { bubbles: false, cancelable: false, detail: null };
//       var evt = document.createEvent('CustomEvent');
//       evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
//       return evt;
//     }
//
//     window.CustomEvent = CustomEvent;
//   })();
//
//   (function() {
//     let stateSymbol = "__state__index__";
//     history.stateIndex = -1;
//     history.states = [];
//     let pushState = history.pushState;
//
//     function add (data, title, url) {
//       if (data == null) data = {};
//       if (typeof data != "object") data = { data: data };
//       data[stateSymbol] = (history.stateIndex + 1);
//       history.states.splice(history.stateIndex + 1, 0, [data, title, url])
//       history.states.splice(history.stateIndex + 2)
//       history.stateIndex++;
//     }
//
//     history.pushState = function(data, title, url = null) {
//       add(data, title, url);
//       pushState.bind(history)(data, title, url);
//     }
//     addEventListener("popstate", function(e) {
//       let eventObject = {};
//       let newStateIndex = e.state != null ? e.state[stateSymbol] : -1;
//       eventObject.from = history.states[history.stateIndex];
//       eventObject.to = newStateIndex > -1 ? history.states[newStateIndex] : null;
//       eventObject.side = history.stateIndex > newStateIndex ? "back" : "forward";
//       eventObject.state = e.state
//       if (newStateIndex > -1 && !(newStateIndex in history.states)) {
//         add(history.state, "", window.location.href);
//       }
//       window.dispatchEvent(new CustomEvent("historyChange", { detail: eventObject }))
//       history.stateIndex = e.state != null ? e.state[stateSymbol] : -1;
//     });
//   })();

}

const xHistory = {
  isInitialLoad: true,
  /**
   * Determine direction of browser history
   * when user clicks forward / back buttons
   *
   * @param event window.onpopstate
   * @returns {string}
   */
  determineDirection (event) {
    let direction

    if (xHistory.lastPosition >= event.state.position) {
      direction = 'back'
    } else {
      direction = 'forward'
    }

    console.log('xHistory.lastPosition', xHistory.lastPosition,
      'event.state.position', event.state.position,
      'direction', direction)

    xHistory.isInitialLoad = false
    xHistory.lastPosition = event.state.position

    return direction
  }
}

export default xHistory