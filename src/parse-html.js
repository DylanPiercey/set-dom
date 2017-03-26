'use strict'

var parser = window.DOMParser && new window.DOMParser()
var documentRootName = 'HTML'
var supportsHTMLType = false
var htmlType = 'text/html'
var testCode = '<br/>'
var mockDoc = null

// Check if browser supports text/html DOMParser
try {
  /* istanbul ignore next: Fails in older browsers */
  if (parser.parseFromString(testCode, htmlType)) supportsHTMLType = true
} catch (err) {}

/**
 * Returns the results of a DOMParser as an HTMLElement.
 * (Shims for older browsers).
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
    // Fallback to innerHTML for other older browsers.
    mockDoc = mockDoc || document.implementation.createHTMLDocument('')
    if (rootName === documentRootName) {
      mockDoc.documentElement.innerHTML = markup
      return mockDoc.documentElement
    } else {
      mockDoc.body.innerHTML = markup
      return mockDoc.body.firstChild
    }
  }
