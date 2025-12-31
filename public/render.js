/**
 * Renders a SJDON Structure and attaches it to DOM
 * using the provided appRoot as the root element.
 * @param {Array|string} element - The SJDON element or string to render.
 * @param {HTMLElement} appRoot - The root DOM element to attach the rendered content.
 * @returns {HTMLElement|Text} The created DOM element or text node.
 */
function renderSJDON(element, appRoot) {
  if (typeof element === "string") {
    const textNode = document.createTextNode(element);
    appRoot.appendChild(textNode);
    return textNode;
  }

  const [tag, ...children] = element;
  if (typeof tag === "function") {
    const props = children[0] || {};
    return renderSJDON(tag(props), appRoot);
  }

  let attrs = null;
  const el = document.createElement(tag);
  appRoot.appendChild(el);

  if (!Array.isArray(children[0]) && typeof children[0] === "object") {
    attrs = children.shift();
    Object.keys(attrs || {}).forEach((key) => {
      el.setAttribute(key, attrs[key]);
    });

    if (children.length === 0) {
      return el;
    }
  }

  if (typeof children[0] === "string") {
    el.textContent = children.shift();

    if (children.length === 0) {
      return el;
    }
  }

  children.forEach((child) => {
    renderSJDON(child, el);
  });
  return el;
}
