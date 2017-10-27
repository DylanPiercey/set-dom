'use strict'

var assert = require('assert')

describe('Parse-html helper', function () {
  var runTest = function() {
    delete require.cache[require.resolve('../src/parse-html')]
    var parseHTML = require('../src/parse-html')
    var html = '<div class="someClass">Test</div>'
    
    // test non-root level
    var parsed = parseHTML(html, 'DIV')
    assert.equal(parsed.outerHTML, html)
    
    // test root level
    var parsedRoot = parseHTML(html, 'HTML')
    assert.equal(parsedRoot.outerHTML, '<html><head></head><body>' + html + '</body></html>')
  }
  it('should use DOMParser', function () {
    // DOMParser is natively supported in the test environment
    runTest()
  })
  
  it('should handle browsers not supporting DOMParser', function () {
    var oldFn = window.DOMParser
    delete window.DOMParser
    runTest()
    window.DOMParser = oldFn
  })
  
  it('should handle browsers not supporting DOMParser with text/html', function () {
    var oldFn = window.DOMParser.prototype.parseFromString
    window.DOMParser.prototype.parseFromString = function(markup, type) {
      if(type == 'text/html')
        throw new Error('text/html not supported')
      // in the test environment, the xhtml parsing is not supported, use html instead
      return oldFn.call(this, markup, 'text/html')
    }
    runTest()
    window.DOMParser.prototype.parseFromString = oldFn
  })
  
  it.skip('should handle browsers not supporting documentElement.innerHTML either', function () {
    var oldFn = window.DOMParser.prototype.parseFromString
    window.DOMParser.prototype.parseFromString = function(markup, type) {
      console.log(markup, type)
      if(type == 'text/html')
        throw Exception('text/html not supported')
      // in the test environment, the xhtml parsing is not supported, use html instead
      return oldFn.call(this, markup, 'text/html')
    }
    var oldDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: function() {
        return oldDesc.get.call(this);
      },
      set: function() {
        if(this.nodeName == 'HTML')
          throw new Error('not supported')
        return oldDesc.set.apply(this, arguments);
      }
    })
    runTest()
    window.DOMParser.prototype.parseFromString = oldFn
    Object.defineProperty(Element.prototype, 'innerHTML', oldDesc)
  })
  
  it('should handle iOS 9 Safari / Safari 9 lowering classes', function () {
    var oldFn = Element.prototype.appendChild
    Element.prototype.appendChild = function(child) {
      // this is essentially what iOS 9 Safari and Safari 9 do:
      // lowercase classList but keep html unchanged
      for(var i=0; i<child.classList.length; i++)
        child.classList[i] = child.classList[i].toLowerCase()
      oldFn.call(this, child)
    }
    runTest()
    Element.prototype.appendChild = oldFn
  })
  
  it('should handle iOS UIWebView sometimes failing', function () {
    var oldFn = window.DOMParser.prototype.parseFromString
    window.DOMParser.prototype.parseFromString = function(data, type) {
      var parsed = oldFn.apply(this, arguments)
      if(parsed.body.firstChild.nodeName == 'WBR')
        // make it pass the testCode in parse-html
        return parsed
      else
        // this is essentially what iOS UIWebView sometimes return
        return { body: null }
    }
    runTest()
    window.DOMParser.prototype.parseFromString = oldFn
  })
})
