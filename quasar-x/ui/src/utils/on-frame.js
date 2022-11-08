export default function onFrame(callback) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback))
}
