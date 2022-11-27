export default function onFrame(callback, timeout = 0) {
  setTimeout(() => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(callback))
  }, timeout)
}
