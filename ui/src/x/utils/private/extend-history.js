
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
    xHistory.lastPosition = e.arguments[0].position
  });

  window.addEventListener('x_pushState', function(e) {
    xHistory.isFirstLoad = false
    xHistory.lastPosition = e.arguments[0].position
  });

  addEventListener('popstate', function(event) {
    xHistory.direction = xHistory.determineDirection(event)
  })

}

export const xHistory = {
  isFirstLoad: true,
  direction: null,
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

    xHistory.isFirstLoad = false
    xHistory.lastPosition = event.state.position

    return direction
  }
}
