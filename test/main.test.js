'use strict'

var assert = require('assert')
var diff = require('../')

describe('Set-DOM', function () {
  it('should error with invalid arguments', function () {
    assert.throws(function () {
      diff('hello world', 'something else')
    }, Error)
  })

  it('should diff attributes', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update attribute.
    el2.setAttribute('a', '1')
    el2.setAttribute('b', '2')
    diff(el1, el2)
    assert.equal(el1.getAttribute('a'), '1', 'update attribute')
    assert.equal(el1.getAttribute('b'), '2', 'update attribute')

    // Remove attribute.
    el2.removeAttribute('a')
    diff(el1, el2)
    assert.equal(el1.getAttribute('a'), null, 'remove attribute')
  })

  it('should diff nodeValue', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner text
    el1.innerHTML = 'hello world'
    el2.innerHTML = 'hello world 2'
    diff(el1, el2)
    assert.equal(el1.firstChild.nodeValue, 'hello world 2', 'update nodevalue')
  })

  it('should diff nodeType', function () {
    var parent = document.createElement('div')
    var el1 = document.createElement('div')
    var el2 = document.createTextNode('hello world')

    parent.appendChild(el1)
    diff(el1, el2)

    assert.equal(parent.firstChild.nodeType, el2.nodeType, 'should have updated node type')
    assert.equal(parent.firstChild.nodeValue, el2.nodeValue, 'should have updated node value')
  })

  it('should diff children', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b><i>text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a><i>text1</i>'
    var originalFirstChild = el1.firstChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i>text1</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
  })

  it('should diff children (id)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b><i id="test">text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a><i id="test">text1</i>'
    var originalFirstChild = el1.firstChild
    var originalLastChild = el1.lastChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i id="test">text1</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
    assert.equal(el1.lastChild, originalLastChild, 'preserved children')
  })

  it('should diff children (data-key) remove', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b><i data-key="test">text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a><i data-key="test">text1</i>'
    var originalFirstChild = el1.firstChild
    var originalLastChild = el1.lastChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i data-key="test">text1</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
    assert.equal(el1.lastChild, originalLastChild, 'preserved children')
  })

  it('should diff children (data-key) move', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b data-key="test1">text</b><i data-key="test2">text2</i>'
    el2.innerHTML = '<a href="link">hello</a><i data-key="test2">text2</i><b data-key="test1">text</b>'
    var originalSecondChild = el1.childNodes[1]
    var originalThirdChild = el1.childNodes[2]
    diff(el1, el2)

    assert.equal(el1.innerHTML, '<a href="link">hello</a><i data-key="test2">text2</i><b data-key="test1">text</b>', 'move children')
    // Ensure that other was not discarded.
    assert.equal(el1.childNodes[1], originalThirdChild, 'preserved children')
    assert.equal(el1.childNodes[2], originalSecondChild, 'preserved children')
  })

  it('should diff children (data-key) with xhtml namespaceURI', function () {
    var el1 = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
    var el2 = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b><i data-key="test">text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a><i data-key="test">text1</i>'
    var originalFirstChild = el1.firstChild
    var originalLastChild = el1.lastChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i data-key="test">text1</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
    assert.equal(el1.lastChild, originalLastChild, 'preserved children')
  })

  it('should diff children (data-key) move (custom attribute)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Set custom key attribute
    diff.KEY = 'data-custom-key'

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b data-custom-key="test1">text</b><i data-custom-key="test2">text2</i>'
    el2.innerHTML = '<a href="link">hello</a><i data-custom-key="test2">text2</i><b data-custom-key="test1">text</b>'
    var originalSecondChild = el1.childNodes[1]
    var originalThirdChild = el1.childNodes[2]
    diff(el1, el2)

    assert.equal(el1.innerHTML, '<a href="link">hello</a><i data-custom-key="test2">text2</i><b data-custom-key="test1">text</b>', 'move children')
    // Ensure that other was not discarded.
    assert.equal(el1.childNodes[1], originalThirdChild, 'preserved children')
    assert.equal(el1.childNodes[2], originalSecondChild, 'preserved children')

    // Reset custom key attribute
    diff.KEY = 'data-key'
  })

  it('should diff children (data-ignore)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div data-ignore="" class="a">initial</div>'
    el2.innerHTML = '<div class="b">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div data-ignore="" class="a">initial</div>', 'did nothing')
  })

  it('should diff children (data-ignore) custom attribute', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Set custom ignore attribute
    diff.IGNORE = 'data-custom-ignore'

    // Update inner html
    el1.innerHTML = '<div data-custom-ignore="" class="a">initial</div>'
    el2.innerHTML = '<div class="b">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div data-custom-ignore="" class="a">initial</div>', 'did nothing')

    // Reset custom ignore attribute
    diff.IGNORE = 'data-ignore'
  })

  it('should automatically parse html for diff', function () {
    var el = document.createElement('div')

    diff(el, '<div><h1>hello world</h1></div>')
    assert.equal(el.innerHTML, '<h1>hello world</h1>', 'should have updated element')
  })

  it('should diff an entire document', function () {
    var doc = document.implementation.createHTMLDocument()

    assert.ok(doc.body, 'should have a body')
    diff(doc, '<!DOCTYPE html><html><head></head><body>hello world</body></html>')
    assert.equal(doc.body.innerHTML, 'hello world', 'should have updated document')
  })
})
