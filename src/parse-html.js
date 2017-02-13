'use strict'

var parser = window.DOMParser && new window.DOMParser()
var htmlType = 'text/html'
var xhtmlType = 'application/xhtml+xml'
var testCode = '<i></i>'
var documentRootName = 'HTML'
var supportsHTMLType = false
var supportsXHTMLType = false

// Check if browser supports text/html DOMParser
try {
  /* istanbul ignore next: Fails in older browsers */
  if (parser.parseFromString(testCode, htmlType)) supportsHTMLType = true
} catch (err) {}

try {
  /* istanbul ignore next: Only used in ie9 */
  if (!supportsHTMLType && parser.parseFromString(testCode, xhtmlType)) supportsXHTMLType = true
} catch (err) {}

/**
 * Returns the results of a DOMParser as an HTMLElement.
 * (Shims for older browser and IE9).
 */
module.exports = supportsHTMLType
  ? function parseHTML (markup, rootName) {
    var doc = parser.parseFromString(markup, htmlType)
    return rootName === documentRootName
      ? doc.documentElement
      : doc.body.firstChild
  }
  /* istanbul ignore next: Only used in older browsers */
  : function parseHTML (markup, rootName) {
    var isRoot = rootName === documentRootName

    // Special case for ie9 (documentElement.innerHTML not supported).
    if (supportsXHTMLType && isRoot) {
      return parser.parseFromString(markup, xhtmlType).documentElement
    }

    // Fallback to innerHTML for other older browsers.
    var doc = document.implementation.createHTMLDocument('')
    if (isRoot) {
      doc.documentElement.innerHTML = markup
      return doc.documentElement
    } else {
      doc.body.innerHTML = markup
      return doc.body.firstChild
    }
  }
