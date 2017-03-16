'use strict'

setDOM.KEY = 'data-key'
setDOM.IGNORE = 'data-ignore'
setDOM.CHECKSUM = 'data-checksum'
var parseHTML = require('./parse-html')
var KEY_PREFIX = '_set-dom-'
var NODE_MOUNTED = KEY_PREFIX + 'mounted'
var MOUNT_EVENT = 'mount'
var DISMOUNT_EVENT = 'dismount'
var ELEMENT_TYPE = window.Node.ELEMENT_NODE
var DOCUMENT_TYPE = window.Node.DOCUMENT_NODE

// Expose api.
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
    dispatch(prev, MOUNT_EVENT)
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
      // Ignore elements if their checksum matches.
      if (getCheckSum(prev) === getCheckSum(next)) return
      // Ignore elements that explicity choose not to be diffed.
      if (isIgnored(prev) && isIgnored(next)) return

      // Update all children (and subchildren).
      setChildNodes(prev, next)

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
    } else {
      // Handle other types of node updates (text/comments/etc).
      // If both are the same type of node we can update directly.
      if (prev.nodeValue !== next.nodeValue) {
        prev.nodeValue = next.nodeValue
      }
    }
  } else {
    // we have to replace the node.
    dispatch(prev, DISMOUNT_EVENT)
    prev.parentNode.replaceChild(next, prev)
    dispatch(next, MOUNT_EVENT)
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
 * Utility that will nodes childern to match another nodes children.
 *
 * @param {Node} prevParent - The existing parent node.
 * @param {Node} nextParent - The new parent node.
 */
function setChildNodes (prevParent, nextParent) {
  var prevKey, nextKey, diffPrev, diffNext, cached
  var prevNode = prevParent.firstChild
  var nextNode = nextParent.firstChild

  // Extract keyed nodes from previous children and keep track of total count.
  var extra = 0
  var prevKeys
  while (prevNode) {
    extra++
    prevKey = getKey(prevNode)
    if (prevKey) {
      if (!prevKeys) prevKeys = {}
      prevKeys[prevKey] = prevNode
    }
    prevNode = prevNode.nextSibling
  }

  // Loop over new nodes and perform updates.
  prevNode = prevParent.firstChild
  while (nextNode) {
    diffNext = nextNode
    nextNode = nextNode.nextSibling

    if (prevKeys && (nextKey = getKey(diffNext)) && (cached = prevKeys[nextKey])) {
      // If we have a key and it existed before we move the previous node to the new position and diff it.
      prevParent.insertBefore(cached, prevNode)
      setNode(cached, diffNext)
    } else if (prevNode && !getKey(prevNode)) {
      // If there was no keys on either side we simply diff the nodes.
      diffPrev = prevNode
      prevNode = prevNode.nextSibling
      setNode(diffPrev, diffNext)
    } else {
      // Otherwise we append or insert the new node at the proper position.
      prevParent.insertBefore(diffNext, prevNode)
      dispatch(diffNext, MOUNT_EVENT)
    }

    extra--
  }

  // If we have any remaining remove them from the end.
  while (extra > 0) {
    extra--
    prevParent.removeChild(dispatch(prevParent.lastChild, DISMOUNT_EVENT))
  }
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
  if (key) return KEY_PREFIX + key
}

/**
 * @private
 * @description
 * Utility to try to pull a checksum attribute from an element.
 * Uses 'data-checksum' or user specified checksum property.
 *
 * @param {Node} node - The node to get the checksum for.
 * @return {String|NaN}
 */
function getCheckSum (node) {
  return node.getAttribute(setDOM.CHECKSUM) || NaN
}

/**
 * @private
 * @description
 * Utility to try to check if an element should be ignored by the algorithm.
 * Uses 'data-ignore' or user specified ignore property.
 *
 * @param {Node} node - The node to check if it should be ignored.
 * @return {Boolean}
 */
function isIgnored (node) {
  return node.getAttribute(setDOM.IGNORE) != null
}

/**
 * Recursively trigger an event for a node and it's children.
 * Only emits events for keyed nodes.
 *
 * @param {Node} node - the initial node.
 */
function dispatch (node, type) {
  // Trigger event for this element if it has a key.
  if (getKey(node)) {
    var ev = document.createEvent('Event')
    var prop = { value: node }
    ev.initEvent(type, false, false)
    Object.defineProperty(ev, 'target', prop)
    Object.defineProperty(ev, 'srcElement', prop)
    node.dispatchEvent(ev)
  }

  // Dispatch to all children.
  var child = node.firstChild
  while (child) child = dispatch(child, type).nextSibling
  return node
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
