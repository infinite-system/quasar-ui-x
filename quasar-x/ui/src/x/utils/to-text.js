export default function toText(html) {
  let tmp = document.createElement("div")
  tmp.appendChild(document.createTextNode(html))
  return tmp.innerHTML;
}
