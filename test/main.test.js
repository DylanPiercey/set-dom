'use strict'

require('jsdom-global')()
var test = require('tape')
var diff = require('../')

test('Attributes', function (t) {
  t.plan(3)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update attribute.
  el2.setAttribute('a', '1')
  el2.setAttribute('b', '2')
  diff(el1, el2)
  t.equal(el1.getAttribute('a'), '1', 'update attribute')
  t.equal(el1.getAttribute('b'), '2', 'update attribute')

  // Remove attribute.
  el2.removeAttribute('a')
  diff(el1, el2)
  t.equal(el1.getAttribute('a'), null, 'remove attribute')
})

test('NodeValue', function (t) {
  t.plan(1)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update inner text
  el1.innerHTML = 'hello world'
  el2.innerHTML = 'hello world 2'
  diff(el1, el2)
  t.equal(el1.firstChild.nodeValue, 'hello world 2', 'update nodevalue')
})

test('Children', function (t) {
  t.plan(2)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update inner html
  el1.innerHTML = '<a href="link">hello</a><b>text</b><i>text2</i>'
  el2.innerHTML = '<a href="link2">hello2</a><i>text1</i>'
  var originalFirstChild = el1.firstChild
  diff(el1, el2)

  t.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i>text1</i></div>', 'update children innerhtml')
  // Ensure that other was not discarded.
  t.equal(el1.firstChild, originalFirstChild, 'preserved children')
})

test('Children (id)', function (t) {
  t.plan(3)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update inner html
  el1.innerHTML = '<a href="link">hello</a><b>text</b><i id="test">text2</i>'
  el2.innerHTML = '<a href="link2">hello2</a><i id="test">text1</i>'
  var originalFirstChild = el1.firstChild
  var originalLastChild = el1.lastChild
  diff(el1, el2)

  t.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i id="test">text1</i></div>', 'update children innerhtml')
  // Ensure that other was not discarded.
  t.equal(el1.firstChild, originalFirstChild, 'preserved children')
  t.equal(el1.lastChild, originalLastChild, 'preserved children')
})

test('Children (data-key) remove', function (t) {
  t.plan(3)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update inner html
  el1.innerHTML = '<a href="link">hello</a><b>text</b><i data-key="test">text2</i>'
  el2.innerHTML = '<a href="link2">hello2</a><i data-key="test">text1</i>'
  var originalFirstChild = el1.firstChild
  var originalLastChild = el1.lastChild
  diff(el1, el2)

  t.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i data-key="test">text1</i></div>', 'update children innerhtml')
  // Ensure that other was not discarded.
  t.equal(el1.firstChild, originalFirstChild, 'preserved children')
  t.equal(el1.lastChild, originalLastChild, 'preserved children')
})

test('Children (data-key) move', function (t) {
  t.plan(3)
  var el1 = document.createElement('div')
  var el2 = document.createElement('div')

  // Update inner html
  el1.innerHTML = '<a href="link">hello</a><b data-key="test1">text</b><i data-key="test2">text2</i>'
  el2.innerHTML = '<a href="link">hello</a><i data-key="test2">text2</i><b data-key="test1">text</b>'
  var originalSecondChild = el1.childNodes[1]
  var originalThirdChild = el1.childNodes[2]
  diff(el1, el2)

  t.equal(el1.innerHTML, '<a href="link">hello</a><i data-key="test2">text2</i><b data-key="test1">text</b>', 'move children')
  // Ensure that other was not discarded.
  t.equal(el1.childNodes[1], originalThirdChild, 'preserved children')
  t.equal(el1.childNodes[2], originalSecondChild, 'preserved children')
})

test('Children (data-key) with xhtml namespaceURI', function (t) {
  t.plan(3)
  var el1 = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
  var el2 = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')

  // Update inner html
  el1.innerHTML = '<a href="link">hello</a><b>text</b><i data-key="test">text2</i>'
  el2.innerHTML = '<a href="link2">hello2</a><i data-key="test">text1</i>'
  var originalFirstChild = el1.firstChild
  var originalLastChild = el1.lastChild
  diff(el1, el2)

  t.equal(el1.outerHTML, '<div><a href="link2">hello2</a><i data-key="test">text1</i></div>', 'update children innerhtml')
  // Ensure that other was not discarded.
  t.equal(el1.firstChild, originalFirstChild, 'preserved children')
  t.equal(el1.lastChild, originalLastChild, 'preserved children')
})
