'use strict'

var parseHTML = require('./parse-html')
var KEY_PREFIX = '_set-dom-'
var NODE_INDEX = KEY_PREFIX + 'index'
var NODE_MOUNTED = KEY_PREFIX + 'mounted'
var ELEMENT_TYPE = window.Node.ELEMENT_NODE
var DOCUMENT_TYPE = window.Node.DOCUMENT_NODE
setDOM.KEY = 'data-key'
setDOM.IGNORE = 'data-ignore'

module.exports = setDOM

/**
 * @description
 * Updates existing dom to match a new dom.
 *
 * @param {Node} prev - The html entity to update.
 * @param {String|Node} next - The updated html(entity).
 */
function setDOM (prev, next) {
  // Ensure a realish dom node is provided.
  assert(prev && prev.nodeType, 'You must provide a valid node to update.')

  // Alias document element with document.
  if (prev.nodeType === DOCUMENT_TYPE) prev = prev.documentElement

  // If a string was provided we will parse it as dom.
  if (typeof next === 'string') next = parseHTML(next, prev.nodeName)

  // Update the node.
  setNode(prev, next)

  // Trigger mount events on initial set.
  if (!prev[NODE_MOUNTED]) {
    prev[NODE_MOUNTED] = true
    mount(prev)
  }
}

/**
 * @private
 * @description
 * Updates a specific htmlNode and does whatever it takes to convert it to another one.
 *
 * @param {Node} prev - The previous HTMLNode.
 * @param {Node} next - The updated HTMLNode.
 */
function setNode (prev, next) {
  if (prev.nodeType === next.nodeType) {
    // Handle regular element node updates.
    if (prev.nodeType === ELEMENT_TYPE) {
      // Ignore elements that explicity choose not to be diffed.
      if (!(prev.attributes[setDOM.IGNORE] && next.attributes[setDOM.IGNORE])) {
        // Update all children (and subchildren).
        setChildNodes(prev, prev.childNodes, next.childNodes)

        // Update the elements attributes / tagName.
        if (prev.nodeName === next.nodeName) {
          // If we have the same nodename then we can directly update the attributes.
          setAttributes(prev, prev.attributes, next.attributes)
        } else {
          // Otherwise clone the new node to use as the existing node.
          var newPrev = next.cloneNode()
          // Copy over all existing children from the original node.
          while (prev.firstChild) newPrev.appendChild(prev.firstChild)
          // Replace the original node with the new one with the right tag.
          prev.parentNode.replaceChild(newPrev, prev)
        }
      }
    } else {
      // Handle other types of node updates (text/comments/etc).
      // If both are the same type of node we can update directly.
      if (prev.nodeValue !== next.nodeValue) {
        prev.nodeValue = next.nodeValue
      }
    }
  } else {
    // we have to replace the node.
    dismount(prev)
    prev.parentNode.replaceChild(next, prev)
    mount(next)
  }
}

/**
 * @private
 * @description
 * Utility that will update one list of attributes to match another.
 *
 * @param {Node} parent - The current parentNode being updated.
 * @param {NamedNodeMap} prev - The previous attributes.
 * @param {NamedNodeMap} next - The updated attributes.
 */
function setAttributes (parent, prev, next) {
  var i, a, b, ns, name

  // Remove old attributes.
  for (i = prev.length; i--;) {
    a = prev[i]
    ns = a.namespaceURI
    name = a.localName
    b = next.getNamedItemNS(ns, name)
    if (!b) prev.removeNamedItemNS(ns, name)
  }

  // Set new attributes.
  for (i = next.length; i--;) {
    a = next[i]
    ns = a.namespaceURI
    name = a.localName
    b = prev.getNamedItemNS(ns, name)
    if (!b) {
      // Add a new attribute.
      next.removeNamedItemNS(ns, name)
      prev.setNamedItemNS(a)
    } else if (b.value !== a.value) {
      // Update existing attribute.
      b.value = a.value
    }
  }
}

/**
 * @private
 * @description
 * Utility that will update one list of childNodes to match another.
 *
 * @param {Node} parent - The current parentNode being updated.
 * @param {NodeList} prevChildNodes - The previous children.
 * @param {NodeList} nextChildNodes - The updated children.
 */
function setChildNodes (parent, prevChildNodes, nextChildNodes) {
  var key, a, b, newPosition, nextEl

  // Convert nodelists into a usuable map.
  var prev = keyNodes(prevChildNodes)
  var next = keyNodes(nextChildNodes)

  // Remove old nodes.
  for (key in prev) {
    if (next[key]) continue
    // Trigger custom dismount event.
    dismount(prev[key])
    // Remove child from dom.
    parent.removeChild(prev[key])
  }

  // Set new nodes.
  for (key in next) {
    a = prev[key]
    b = next[key]
    // Extract the position of the new node.
    newPosition = b[NODE_INDEX]

    if (a) {
      // Update an existing node.
      setNode(a, b)
      // Check if the node has moved in the tree.
      if (a[NODE_INDEX] === newPosition) continue
      // Get the current element at the new position.
      /* istanbul ignore next */
      nextEl = prevChildNodes[newPosition] || null // TODO: figure out if || null is needed.
      // Check if the node has already been properly positioned.
      if (nextEl === a) continue
      // Reposition node.
      parent.insertBefore(a, nextEl)
    } else {
      // Get the current element at the new position.
      nextEl = prevChildNodes[newPosition] || null
      // Append the new node at the correct position.
      parent.insertBefore(b, nextEl)
      // Trigger custom mounted event.
      mount(b)
    }
  }
}

/**
 * @private
 * @description
 * Converts a nodelist into a keyed map.
 * This is used for diffing while keeping elements with 'data-key' or 'id' if possible.
 *
 * @param {NodeList} childNodes - The childNodes to convert.
 * @return {Object}
 */
function keyNodes (childNodes) {
  var result = {}
  var len = childNodes.length
  var el

  for (var i = 0; i < len; i++) {
    el = childNodes[i]
    el[NODE_INDEX] = i
    result[getKey(el) || i] = el
  }

  return result
}

/**
 * @private
 * @description
 * Utility to try to pull a key out of an element.
 * Uses 'data-key' if possible and falls back to 'id'.
 *
 * @param {Node} node - The node to get the key for.
 * @return {String}
 */
function getKey (node) {
  if (node.nodeType !== ELEMENT_TYPE) return
  var key = node.getAttribute(setDOM.KEY) || node.id
  if (key) key = KEY_PREFIX + key
  return key && KEY_PREFIX + key
}

/**
 * Recursively trigger a mount event for a node and it's children.
 *
 * @param {Node} node - the initial node to be mounted.
 */
function mount (node) {
  // Trigger mount event for this element if it has a key.
  if (getKey(node)) dispatch(node, 'mount')

  // Mount all children.
  var child = node.firstChild
  while (child) {
    mount(child)
    child = child.nextSibling
  }
}

/**
 * Recursively trigger a dismount event for a node and it's children.
 *
 * @param {Node} node - the initial node to be dismounted.
 */
function dismount (node) {
  // Dismount all children.
  var child = node.firstChild
  while (child) {
    dismount(child)
    child = child.nextSibling
  }

  // Trigger dismount event for this element if it has a key.
  if (getKey(node)) dispatch(node, 'dismount')
}

/**
 * @private
 * @description
 * Create and dispatch a custom event.
 *
 * @param {Node} el - the node to dispatch the event for.
 * @param {String} type - the name of the event.
 */
function dispatch (el, type) {
  var e = document.createEvent('Event')
  var prop = { value: el }
  e.initEvent(type, false, false)
  Object.defineProperty(e, 'target', prop)
  Object.defineProperty(e, 'srcElement', prop)
  el.dispatchEvent(e)
}

/**
 * @private
 * @description
 * Confirm that a value is truthy, throws an error message otherwise.
 *
 * @param {*} val - the val to test.
 * @param {String} msg - the error message on failure.
 * @throws Error
 */
function assert (val, msg) {
  if (!val) throw new Error('set-dom: ' + msg)
}
