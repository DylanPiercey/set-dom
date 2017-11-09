'use strict'
var parser = window.DOMParser && new window.DOMParser()
var documentRootName = 'HTML'
var supportsHTMLType = false
var supportsInnerHTML = false
var htmlType = 'text/html'
var xhtmlType = 'application/xhtml+xml'
var testClass = 'A'
var testCode = '<wbr class="' + testClass + '"/>'

try {
  // Check if browser supports text/html DOMParser
  var parsed = parser.parseFromString(testCode, htmlType).body.firstChild
  // Some browsers (iOS 9 and Safari 9) lowercase classes for parsed elements
  // but only when appending to DOM, so use innerHTML instead
  var d = document.createElement('div')
  d.appendChild(parsed)
  if (d.firstChild.classList[0] !== testClass) throw new Error()
  supportsHTMLType = true
} catch (e) {}

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

function DOMParserParse (markup, rootName) {
  var doc = parser.parseFromString(markup, htmlType)
  // Patch for iOS UIWebView not always returning doc.body synchronously
  if (!doc.body) { return fallbackParse(markup, rootName) }

  return rootName === documentRootName
    ? doc.documentElement
    : doc.body.firstChild
}

function fallbackParse (markup, rootName) {
  // Fallback to innerHTML for other older browsers.
  if (rootName === documentRootName) {
    if (supportsInnerHTML) {
      mockHTML.innerHTML = markup
      return mockHTML
    } else {
      // IE9 does not support innerhtml at root level.
      // We get around this by parsing everything except the body as xhtml.
      var bodyMatch = markup.match(bodyReg)
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

/**
 * Returns the results of a DOMParser as an HTMLElement.
 * (Shims for older browsers).
 */
module.exports = supportsHTMLType
  ? DOMParserParse
  : fallbackParse
