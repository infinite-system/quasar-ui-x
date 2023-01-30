import onFrame from './on-frame'
export default function keepAlive(isAlive) {
  isAlive.value = false
  onFrame(() => isAlive.value = true)
}
