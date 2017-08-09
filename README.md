<h1 align="center">
  <!-- Logo -->
  <a href="https://github.com/DylanPiercey/set-dom" alt="Set-DOM">
    <img src="https://raw.githubusercontent.com/DylanPiercey/set-dom/master/logo.png" alt="Set-DOM Logo"/>
  </a>

  <br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/set-dom">
    <img src="https://img.shields.io/npm/v/set-dom.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Travis build -->
  <a href="https://travis-ci.org/DylanPiercey/set-dom">
  <img src="https://img.shields.io/travis/DylanPiercey/set-dom.svg?style=flat-square" alt="Build status"/>
  </a>
  <!-- Coveralls coverage -->
  <a href="https://coveralls.io/github/DylanPiercey/set-dom">
    <img src="https://img.shields.io/coveralls/DylanPiercey/set-dom.svg?style=flat-square" alt="Test Coverage"/>
  </a>
  <!-- File size -->
  <a href="https://github.com/DylanPiercey/set-dom/blob/master/dist/set-dom.js">
    <img src="https://badge-size.herokuapp.com/DylanPiercey/set-dom/master/dist/set-dom.js?style=flat-square" alt="File size"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/set-dom">
    <img src="https://img.shields.io/npm/dm/set-dom.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter chat -->
  <a href="https://gitter.im/DylanPiercey/set-dom">
    <img src="https://img.shields.io/gitter/room/DylanPiercey/set-dom.svg?style=flat-square" alt="Gitter Chat"/>
  </a>

  <a href="https://saucelabs.com/beta/builds/2f92fb469e0640e0bcf94250d41af27a">
    <img src="https://saucelabs.com/browser-matrix/dylanpiercey.svg" alt="Browser Matrix">
  </a>
</h1>

A lightweight library to update DOM and persist state.
IE: React diffing with html instead of JSX (bring your own templating language).

# Why
JSX is great but there are so many other nice alternatives.
React is great but it's clunky and opinionated.

This is inspired by [diffhtml](https://github.com/tbranyen/diffhtml), [morphdom](https://github.com/patrick-steele-idem/morphdom) and my knowledge from [tusk](https://github.com/DylanPiercey/tusk). I set out to create a no nonsense "dom to dom" diffing algorithm that was fast and compact.

### Features
* ~800 bytes min/gzip.
* Minimal API.
* Keyed html elements (`data-key` or `id` to shuffle around nodes).
* Use whatever you want to generate html.

# Installation

#### Npm
```console
npm install set-dom
```

#### [Download](https://raw.githubusercontent.com/DylanPiercey/set-dom/master/dist/set-dom.js)
```html
<script type="text/javascript" src="set-dom.js"></script>
<script>
    define(['set-dom'], function (setDOM) {...}); // AMD
    window.setDOM; // Global set-dom if no module system in place.
</script>
```

# Example


```javascript
const setDOM = require("set-dom");

// We will use handlebars for our example.
const hbs = require("handlebars");
const homePage = hbs.compile(`
    <html>
        <head>
            <title>My App</title>
            <meta name="description" content="Rill Application">
        </head>
        <body>
            <div class="app" data-key="home-page">
                {{title}}
                {{#each frameworks}}
                    <div data-key={{name}}>
                        {{name}} is pretty cool.
                    </div>
                {{/each}}
            </div>
            <script src="/app.js"/>
        </body>
    </html>
`);

// You can replace the entire page with your new html (only updates changed elements).
setDOM(document, homePage({
    title: "Hello World.",
    frameworks: [
        { name: "React" },
        { name: "Angular" },
        { name: "Ember" },
        { name: "Backbone" },
        { name: "Everything" }
    ]
}));

// Or update individual elements.
setDOM(myElement, myHTML);
```

# API
+ **setDOM(HTMLEntity, html|HTMLEntity)** : Updates existing DOM to new DOM in as few operations as possible.

---

# Advanced Tips

## Keys
Just like React (although slightly different) `set-dom` supports keyed nodes.
To help the diffing algorithm reposition your elements be sure to provide a `data-key` or `id` attribute on nodes inside a map. This is optional but key for performance when re-ordering/modifying lists.

Another key difference from React is that `set-dom` simply can't tell when you are rendering an entirely different component. As such it is good practice to use `data-key` when you know that most of the html will be discarded (like when rendering an entirely different page) to skip the diffing process entirely.

## Checksum
Another trick to help set-dom with it's diffing algorithm is to provide a `data-checksum` attribute. This attribute will only do any diff on an element (and it's children) if the checksum changes allowing you to skip diffing entire trees of the document. Check out [hash-sum](https://github.com/bevacqua/hash-sum) for a quick and simple checksum that you can use in your templates. Simply hash the state/data for your view and set-dom will only do any changes to the document once the hash has changed.

## Ignored
Sometimes it is required to simply escape the whole diffing paradigm and do all of the manual dom work yourself. With `set-dom` it is easy to include these types of elements in the page using a special `data-ignore` attribute.

Any elements that have a `data-ignore` will only be diffed when the `data-ignore` attribute is removed. The only thing `set-dom` will do for you in this case is automatically add and remove the element.

## Event delegation
Unlike React, set-dom does not provide a way for you to add event listeners to your elements. Fortunately there is a simple approach that enables this that you have probably used before (aka jquery), [event delegation](https://davidwalsh.name/event-delegate). Check out something like [component-delegate](https://github.com/component/delegate) for a lightweight library that does this for you. Or if you are using [Rill](https://github.com/rill-js/rill) checkout [@rill/delegate](https://github.com/rill-js/delegate).

## Mounting and Dismounting.
Often you need the ability to intercept when a component is inserted or removed from the DOM.
Keyed elements (those with `data-key` or `id` attributes) will automatically emit custom `mount` and `dismount` events when they are inserted and removed from the DOM.

You can use these events to handle setup and teardown of complex components along side event delegation.

## Overrides
You can also easily override the attributes used for both *keying* and *ignoring* by manually updating the `KEY`, `CHECKSUM` and `IGNORE` properties of `set-dom` like so.

```js
// Change 'data-key' to 'data-my-key'
setDOM.KEY = 'data-my-key'

// Change 'data-checksum' to 'data-my-checksum'
setDOM.CHECKSUM = 'data-my-checksum'

// Change 'data-ignore' to 'data-my-ignore'
setDOM.IGNORE = 'data-my-ignore'
```

### Benchmarks
Benchmarks are available on the [vdom-benchmark](https://vdom-benchmark.github.io/vdom-benchmark/) website.

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
