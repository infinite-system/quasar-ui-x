
export const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
}

export const session = {
  get: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch (e) {}
  },
  set: (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
}