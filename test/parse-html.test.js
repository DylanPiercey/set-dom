'use strict'

var assert = require('assert')
var isJSDOM = global !== window

isJSDOM && describe('Parse-html helper', function () {
  var runTests = function () {
    delete require.cache[require.resolve('../src/parse-html')]
    var parseHTML = require('../src/parse-html')
    var divHtml = '<div class="someClass">Test</div>'
    var bodyHtml = '<body>' + divHtml + '</body>'
    var headHTML = '<head><title>Test</title></head>'

    // test non-root level
    var parsed = parseHTML(divHtml, 'DIV')
    assert.equal(parsed.outerHTML, divHtml)

    // test root level (with body)
    parsed = parseHTML(headHTML + bodyHtml, 'HTML')
    assert.equal(parsed.outerHTML, '<html>' + headHTML + bodyHtml + '</html>')

    // test root level (without body)
    parsed = parseHTML(headHTML, 'HTML')
    assert.equal(parsed.outerHTML, '<html>' + headHTML + '<body></body></html>')
  }

  it('should use DOMParser', function () {
    // DOMParser is natively supported in the test environment
    runTests()
  })

  describe('Without DOMParser', function () {
    var oldFn
    before(function () {
      oldFn = window.DOMParser
      delete window.DOMParser
    })
    after(function () {
      window.DOMParser = oldFn
    })

    it('should still work', function () {
      runTests()
    })
  })

  describe('With DOMParser, but without text/html support', function () {
    var oldFn
    before(function () {
      oldFn = window.DOMParser.prototype.parseFromString
      window.DOMParser.prototype.parseFromString = function (markup, type) {
        if (type === 'text/html') { throw new Error('text/html not supported') }
        // in the test environment, the xhtml parsing is not supported, use html instead
        return oldFn.call(this, markup, 'text/html')
      }
    })
    after(function () {
      window.DOMParser.prototype.parseFromString = oldFn
    })

    it('should still work', function () {
      runTests()
    })

    describe('AND without support for documentElement.innerHTML', function () {
      var oldDesc
      before(function () {
        oldDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
        Object.defineProperty(Element.prototype, 'innerHTML', {
          get: function () {
            return oldDesc.get.call(this)
          },
          set: function () {
            if (this.nodeName === 'HTML') { throw new Error('not supported') }
            return oldDesc.set.apply(this, arguments)
          }
        })
      })
      after(function () {
        Object.defineProperty(Element.prototype, 'innerHTML', oldDesc)
      })

      it('should still work', function () {
        runTests()
      })
    })
  })

  describe('With weird className lowercasing (iOS 9 Safari / Safari 9)', function () {
    var oldFn
    before(function () {
      oldFn = Element.prototype.appendChild
      Element.prototype.appendChild = function (child) {
        // this is essentially what iOS 9 Safari and Safari 9 do:
        // lowercase classList but keep html unchanged
        if (child.hasAttribute('class')) {
          child.setAttribute('class', child.getAttribute('class').toLowerCase())
        }

        oldFn.call(this, child)
      }
    })
    after(function () {
      Element.prototype.appendChild = oldFn
    })

    it('should still work', function () {
      runTests()
    })
  })

  describe('With random DOMParser failures (iOS UIWebView)', function () {
    var oldFn
    before(function () {
      oldFn = window.DOMParser.prototype.parseFromString
      window.DOMParser.prototype.parseFromString = function (data, type) {
        var parsed = oldFn.apply(this, arguments)
        if (parsed.body.firstChild && parsed.body.firstChild.nodeName === 'WBR') {
          // make it pass the testCode in parse-html
          return parsed
        } else {
          // this is essentially what iOS UIWebView sometimes returns
          return { body: null }
        }
      }
    })
    after(function () {
      window.DOMParser.prototype.parseFromString = oldFn
    })

    it('should still work', function () {
      runTests()
    })
  })
})
