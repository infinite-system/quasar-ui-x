export function toText(html) {
  let tmp = document.createElement("div")
  tmp.appendChild(document.createTextNode(html))
  return tmp.innerHTML;
}

export function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function kebabToPascalCase(str){
  return capitalize(str.replace(/([A-Za-z0-9])-([A-Za-z0-9])/g, "$1\U$2"))
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
