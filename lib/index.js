(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['b'], factory);
  } else {
    // Browser globals
    root.setDOM = factory(root.b);
  }
}(this, function (b) {
  'use strict'
  
  var NODE_INDEX = '__set-dom-index__'
  var TEXT_TYPE = 3
  var ELEMENT_TYPE = 1
  var HTML_ELEMENT = document.createElement('html')
  var BODY_ELEMENT = document.createElement('body')
  
  /**
   * @description
   * Updates existing dom to match a new dom.
   *
   * @param {HTMLEntity} prev - The html entity to update.
   * @param {String|HTMLEntity} next - The updated html(entity).
   */
  function setDOM (prev, next) {
    // Alias document element with document.
    if (prev === document) prev = document.documentElement
  
    // If a string was provided we will parse it as dom.
    if (typeof next === 'string') {
      if (prev === document.documentElement) {
        HTML_ELEMENT.innerHTML = next
        next = HTML_ELEMENT
      } else {
        BODY_ELEMENT.innerHTML = next
        next = BODY_ELEMENT.firstChild
      }
    }
  
    // Update the node.
    setNode(prev, next)
  }
  
  /**
   * @private
   * @description
   * Updates a specific htmlNode and does whatever it takes to convert it to another one.
   *
   * @param {HTMLEntity} prev - The previous HTMLNode.
   * @param {HTMLEntity} next - The updated HTMLNode.
   */
  function setNode (prev, next) {
    // Handle text node update.
    if (next.nodeType === TEXT_TYPE) {
      if (prev.nodeType !== TEXT_TYPE) {
        // we have to replace the node.
        prev.parentNode.replaceChild(next, prev)
      } else if (prev.nodeValue !== next.nodeValue) {
        // If both are text nodes we can update directly.
        prev.nodeValue = next.nodeValue
      }
      return
    }
  
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
  
  /*
   * @private
   * @description
   * Utility that will update one list of attributes to match another.
   *
   * @param {HTMLEntity} parent - The current parentNode being updated.
   * @param {Attributes} prev - The previous attributes.
   * @param {Attributes} next - The updated attributes.
   */
  function setAttributes (parent, prev, next) {
    var i, a, b, ns
  
    // Remove old attributes.
    for (i = prev.length; i--;) {
      a = prev[i]
      ns = a.namespaceURI
      b = next.getNamedItemNS(ns, a.name)
      if (!b) prev.removeNamedItemNS(ns, a.name)
    }
  
    // Set new attributes.
    for (i = next.length; i--;) {
      a = next[i]
      ns = a.namespaceURI
      b = prev.getNamedItemNS(ns, a.name)
      if (!b) {
        // Add a new attribute.
        next.removeNamedItemNS(ns, a.name)
        prev.setNamedItemNS(a)
      } else if (b.value !== a.value) {
        // Update existing attribute.
        b.value = a.value
      }
    }
  }
  
  /*
   * @private
   * @description
   * Utility that will update one list of childNodes to match another.
   *
   * @param {HTMLEntity} parent - The current parentNode being updated.
   * @param {NodeList} prevChildNodes - The previous children.
   * @param {NodeList} nextChildNodes - The updated children.
   */
  function setChildNodes (parent, prevChildNodes, nextChildNodes) {
    var key, a, b, oldPosition, newPosition
  
    // Convert nodelists into a usuable map.
    var prev = keyNodes(prevChildNodes)
    var next = keyNodes(nextChildNodes)
  
    // Remove old nodes.
    for (key in prev) {
      if (next[key]) continue
      parent.removeChild(prev[key])
    }
  
    // Set new nodes.
    for (key in next) {
      a = prev[key]
      b = next[key]
      if (a) {
        // Update an existing node.
        setNode(a, b)
        // Check if the node has moved in the tree.
        oldPosition = a[NODE_INDEX]
        newPosition = b[NODE_INDEX]
        if (oldPosition === newPosition) continue
        // Check if the node has already been properly positioned.
        if (prevChildNodes[newPosition] === a) continue
        // Reposition node.
        parent.insertBefore(a, prevChildNodes[newPosition])
      } else {
        // Append the new node.
        parent.appendChild(b)
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
  
    for (var i = childNodes.length, el; i--;) {
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
   * (Uses 'id' if possible and falls back to 'data-key')
   *
   * @param {HTMLEntity} node - The node to get the key for.
   * @return {String}
   */
  function getKey (node) {
    if (node.nodeType !== ELEMENT_TYPE) return
    return node.id || node.getAttribute('data-key')
  }
    return setDOM;
}));


