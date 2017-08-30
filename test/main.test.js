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
    el1.appendChild(document.createTextNode('text a'))
    el1.appendChild(document.createTextNode('text b'))
    el2.appendChild(document.createTextNode('text a'))
    el2.appendChild(document.createTextNode('text c'))
    var originalFirstChild = el1.firstChild
    diff(el1, el2)
    assert.ok(el1.firstChild === originalFirstChild, 'Keep original first child')
    assert.equal(originalFirstChild.nodeValue, 'text a', 'Keep first child node value')
    assert.equal(originalFirstChild.nextSibling.nodeValue, 'text c', 'Update sibling node value')
  })

  it('should diff nodeType', function () {
    var parent = document.createElement('div')
    var el1 = document.createElement('div')
    var el2 = document.createTextNode('hello world')
    el1.id = 'test'
    el2.id = 'test'

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

  it('should diff children with spaces', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a> <b>text</b> <i>text2</i>'
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

  it('should diff children (data-key) move by deleting', function () {
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

  it('should diff children (data-key) move by shuffling', function () {
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

  it('should diff children (data-key) remove', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b><i data-key="test">text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a>'
    var originalFirstChild = el1.firstChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
  })

  it('should diff children (data-key) insert new key', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><b>text</b>'
    el2.innerHTML = '<a href="link2">hello2</a><i data-key="test">text2</i>'
    var originalFirstChild = el1.firstChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i data-key="test">text2</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
  })

  it('should diff children (data-key) insert new node', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<a href="link">hello</a><i data-key="test">text2</i>'
    el2.innerHTML = '<a href="link2">hello2</a><b>test</b><i data-key="test">text2</i>'
    var originalFirstChild = el1.firstChild
    diff(el1, el2)

    assert.equal(el1.outerHTML, '<div><a href="link2">hello2</a><b>test</b><i data-key="test">text2</i></div>', 'update children innerhtml')
    // Ensure that other was not discarded.
    assert.equal(el1.firstChild, originalFirstChild, 'preserved children')
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

  it('should preserve classes', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a">initial</div>'
    el2.innerHTML = '<div class="B">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="B">final</div>', 'updated dom')
  })

  it('should diff children (data-ignore)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a" data-ignore="">initial</div>'
    el2.innerHTML = '<div class="b" data-ignore="">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="a" data-ignore="">initial</div>', 'did nothing')
  })

  it('should diff when no longer ignored (data-ignore)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a" data-ignore="">initial</div>'
    el2.innerHTML = '<div class="b">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="b">final</div>', 'updated dom')
  })

  it('should diff children (data-ignore) custom attribute', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Set custom ignore attribute
    diff.IGNORE = 'data-custom-ignore'

    // Update inner html
    el1.innerHTML = '<div class="a" data-custom-ignore="">initial</div>'
    el2.innerHTML = '<div class="b" data-custom-ignore="">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="a" data-custom-ignore="">initial</div>', 'did nothing')

    // Reset custom ignore attribute
    diff.IGNORE = 'data-ignore'
  })

  it('should diff children (data-checksum)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a" data-checksum="abc">initial</div>'
    el2.innerHTML = '<div class="b" data-checksum="efg">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="b" data-checksum="efg">final</div>', 'should have updated element')
  })

  it('should not diff children (data-checksum)', function () {
    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a" data-checksum="abc">initial</div>'
    el2.innerHTML = '<div class="b" data-checksum="abc">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="a" data-checksum="abc">initial</div>', 'did nothing')
  })

  it('should diff children (data-checksum) custom attribute', function () {
    // Set custom checksum attribute
    diff.CHECKSUM = 'data-custom-checksum'

    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner html
    el1.innerHTML = '<div class="a" data-custom-checksum="abc">initial</div>'
    el2.innerHTML = '<div class="b" data-custom-checksum="efg">final</div>'

    // Attempt to diff
    diff(el1, el2)
    assert.equal(el1.innerHTML, '<div class="b" data-custom-checksum="efg">final</div>', 'should have updated element')

    // Reset custom checksum attribute
    diff.CHECKSUM = 'data-checksum'
  })

  it('should automatically parse html for diff', function () {
    var el = document.createElement('div')

    diff(el, '<div><h1>hello world</h1></div>')
    assert.equal(el.innerHTML, '<h1>hello world</h1>', 'should have updated element')
  })

  it('should diff an entire document', function () {
    var doc = document.implementation.createHTMLDocument('test')

    assert.ok(doc.body, 'should have a body')
    diff(doc, '<!DOCTYPE html><html><head></head><body>hello world</body></html>')
    assert.equal(doc.body.innerHTML, 'hello world', 'should have updated document')
  })

  it('should diff a document fragment', function () {
    var fragment1 = document.createDocumentFragment()
    var fragment2 = document.createDocumentFragment()

    var el1 = document.createElement('div')
    var el2 = document.createElement('div')

    // Update inner text
    el1.innerHTML = 'hello world'
    el2.innerHTML = 'hello world 2'

    fragment1.appendChild(el1)
    fragment2.appendChild(el2)

    diff(fragment1, fragment2)
    assert.equal(el1.firstChild.nodeValue, 'hello world 2', 'update nodevalue')
  })
})
