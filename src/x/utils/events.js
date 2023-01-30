/**
 * Extends DOM element to be able to extract events that are registered to it
 * Extends with element with following methods:
 * element.addEventListener()
 * element.removeEventListener()
 * element.getEventListeners()
 * @adopted from https://stackoverflow.com/a/35235801/1502706
 */
let ListenerTracker = new function () {

  let targets = [];
  // listener tracking datas
  let _elements_ = [];
  let _listeners_ = [];

  this.init = function () {
    this.listen(Element, window);
  };

  this.listen = function () {
    for (let i = 0; i < arguments.length; i++) {
      if (targets.indexOf(arguments[i]) === -1) {
        targets.push(arguments[i]);//avoid duplicate call
        intercep_events_listeners(arguments[i]);
      }
    }
  };
  // register individual element an returns its corresponding listeners
  let register_element = function (element) {
    if (_elements_.indexOf(element) == -1) {
      // NB : split by useCapture to make listener easier to find when removing
      let elt_listeners = [{/*useCapture=false*/ }, {/*useCapture=true*/ }];
      _elements_.push(element);
      _listeners_.push(elt_listeners);
    }
    return _listeners_[_elements_.indexOf(element)];
  };

  let intercep_events_listeners = function (target) {
    let _target = target;
    if (target.prototype) _target = target.prototype;
    if (_target.getEventListeners) return;
    if (typeof (_target.addEventListener) !== 'function' || typeof (_target.removeEventListener) !== 'function') {
      throw('\nListenerTracker Error:\nUnwrappable target.');
    }
    // backup overrided methods
    let _super_ = {
      "addEventListener": _target.addEventListener,
      "removeEventListener": _target.removeEventListener
    };

    _target["addEventListener"] = function (type, listener, useCapture) {
      let listeners = register_element(this);
      // add event before to avoid registering if an error is thrown
      _super_["addEventListener"].apply(this, arguments);
      // adapt to 'elt_listeners' index
      let uc = (typeof (useCapture) === 'object' ? useCapture.useCapture : useCapture) ? 1 : 0;
      if (!listeners[uc][type]) listeners[uc][type] = [];
      listeners[uc][type].push({ cb: listener, args: arguments });
    };

    _target["removeEventListener"] = function (type, listener, useCapture) {
      let listeners = register_element(this);
      // add event before to avoid registering if an error is thrown
      _super_["removeEventListener"].apply(this, arguments);
      // adapt to 'elt_listeners' index
      useCapture = (typeof (useCapture) === 'object' ? useCapture.useCapture : useCapture) ? 1 : 0;
      if (!listeners[useCapture][type]) return;
      let lid = listeners[useCapture][type].findIndex(obj => obj.cb === listener);
      if (lid > -1) listeners[useCapture][type].splice(lid, 1);
    };

    _target["getEventListeners"] = function (type) {
      let listeners = register_element(this);
      // convert to listener datas list
      let result = [];
      for (let useCapture = 0, list; list = listeners[useCapture]; useCapture++) {
        if (typeof (type) == "string") {// filtered by type
          if (list[type]) {
            for (let id in list[type]) {
              result.push({
                "type": type,
                "listener": list[type][id].cb,
                "args": list[type][id].args,
                "useCapture": !!useCapture
              });
            }
          }
        } else {// all
          for (let _type in list) {
            for (let id in list[_type]) {
              result.push({
                "type": _type,
                "listener": list[_type][id].cb,
                "args": list[_type][id].args,
                "useCapture": !!useCapture
              });
            }
          }
        }
      }
      return result;
    };
  };

}();

export default ListenerTracker
