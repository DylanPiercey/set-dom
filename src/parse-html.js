'use strict'

var parser = window.DOMParser && new window.DOMParser()
var documentRootName = 'HTML'
var supportsHTMLType = false
var supportsInnerHTML = false
var htmlType = 'text/html'
var xhtmlType = 'application/xhtml+xml'
var testCode = '<br/>'

/* istanbul ignore next: Fails in older browsers */
try {
  // Check if browser supports text/html DOMParser
  if (parser.parseFromString(testCode, htmlType)) supportsHTMLType = true
} catch (e) {
  var mockDoc = document.implementation.createHTMLDocument('')
  var mockHTML = mockDoc.documentElement
  var mockBody = mockDoc.body
  try {
    // Check if browser supports documentElement.innerHTML
    mockHTML.innerHTML += ''
    supportsInnerHTML = true
  } catch (e) {
    // Check if browser supports xhtml parsing.
    parser.parseFromString(testCode, xhtmlType)
    var bodyReg = /(<body[^>]*>)([\s\S]*)<\/body>/
  }
}

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
    if (rootName === documentRootName) {
      if (supportsInnerHTML) {
        mockHTML.innerHTML = markup
        return mockHTML
      } else {
        // IE9 does not support innerhtml at root level.
        // We get arround this by parsing everything except the body as xhtml.
        var bodyMatch = bodyReg.exec(markup)
        if (bodyMatch) {
          var bodyContent = bodyMatch[2]
          var startBody = bodyMatch.index + bodyMatch[1].length
          var endBody = startBody + bodyContent.length
          markup = markup.slice(0, startBody) + markup.slice(endBody)
          mockBody.innerHTML = bodyContent
        }

        var doc = parser.parseFromString(markup, xhtmlType)
        var body = doc.body
        while (mockBody.firstChild) body.appendChild(mockBody.firstChild)
        return doc.documentElement
      }
    } else {
      mockBody.innerHTML = markup
      return mockBody.firstChild
    }
  }
