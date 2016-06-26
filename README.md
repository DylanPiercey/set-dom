# Set-DOM

A lightweight (~800 bytes) library to update DOM and persist state.
IE: React diffing with html instead of JSX (bring your own templating language).

[![Join the chat at https://gitter.im/DylanPiercey/set-dom](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DylanPiercey/set-dom?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://img.shields.io/npm/dm/set-dom.svg)](https://www.npmjs.com/package/set-dom)

# Why
JSX is great but there are so many other nice alternatives.
React is great but it's clunky and opinionated.

This is inspired by [diffhtml](https://github.com/tbranyen/diffhtml), [morphdom](https://github.com/patrick-steele-idem/morphdom) and my knowlegde from [tusk](https://github.com/DylanPiercey/tusk). I set out to create a no nonsense "dom to dom" diffing algorithm that was fast and compact.

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

# Advanced Performance

## Keyed Elements
Just like React (although slightly different) `set-dom` supports keyed nodes.
To help the diffing algorithm reposition your elements be sure to provide a `data-key` or `id` attribute on nodes inside a map. This is optional but key for performance when re-ordering/modifying lists.

Another key difference from React is that `set-dom` simply can't tell when you are rendering an entirely different component. As such it is good practice to use `data-key` when you know that most of the html will be discarded (like when rendering an entirely different page) to skip the diffing process entirely.

### Contributions

* Use `npm test` to run tests.

I'm working on creating some benchmarks but any help would be awesome.
Please feel free to create a PR!
