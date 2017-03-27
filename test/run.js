(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.setDOM = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require(5);
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"5":5}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require(4);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require(3);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require(2),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"2":2,"3":3,"4":4}],6:[function(require,module,exports){
'use strict'

setDOM.KEY = 'data-key'
setDOM.IGNORE = 'data-ignore'
setDOM.CHECKSUM = 'data-checksum'
var parseHTML = require(7)
var KEY_PREFIX = '_set-dom-'
var NODE_MOUNTED = KEY_PREFIX + 'mounted'
var MOUNT_EVENT = 'mount'
var DISMOUNT_EVENT = 'dismount'
var ELEMENT_TYPE = 1
var DOCUMENT_TYPE = 9
var DOCUMENT_FRAGMENT_TYPE = 11

// Expose api.
module.exports = setDOM

/**
 * @description
 * Updates existing dom to match a new dom.
 *
 * @param {Node} oldNode - The html entity to update.
 * @param {String|Node} newNode - The updated html(entity).
 */
function setDOM (oldNode, newNode) {
  // Ensure a realish dom node is provided.
  assert(oldNode && oldNode.nodeType, 'You must provide a valid node to update.')

  // Alias document element with document.
  if (oldNode.nodeType === DOCUMENT_TYPE) oldNode = oldNode.documentElement

  // Document Fragments don't have attributes, so no need to look at checksums, ignored, attributes, or node replacement.
  if (newNode.nodeType === DOCUMENT_FRAGMENT_TYPE) {
    // Simply update all children (and subchildren).
    setChildNodes(oldNode, newNode)
  } else {
    // Otherwise we diff the entire old node.
    setNode(oldNode, typeof newNode === 'string'
      // If a string was provided we will parse it as dom.
      ? parseHTML(newNode, oldNode.nodeName)
      : newNode
    )
  }

  // Trigger mount events on initial set.
  if (!oldNode[NODE_MOUNTED]) {
    oldNode[NODE_MOUNTED] = true
    dispatch(oldNode, MOUNT_EVENT)
  }
}

/**
 * @private
 * @description
 * Updates a specific htmlNode and does whatever it takes to convert it to another one.
 *
 * @param {Node} oldNode - The previous HTMLNode.
 * @param {Node} newNode - The updated HTMLNode.
 */
function setNode (oldNode, newNode) {
  if (oldNode.nodeType === newNode.nodeType) {
    // Handle regular element node updates.
    if (oldNode.nodeType === ELEMENT_TYPE) {
      // Ignore elements if their checksum matches.
      if (getCheckSum(oldNode) === getCheckSum(newNode)) return
      // Ignore elements that explicity choose not to be diffed.
      if (isIgnored(oldNode) && isIgnored(newNode)) return

      // Update all children (and subchildren).
      setChildNodes(oldNode, newNode)

      // Update the elements attributes / tagName.
      if (oldNode.nodeName === newNode.nodeName) {
        // If we have the same nodename then we can directly update the attributes.
        setAttributes(oldNode.attributes, newNode.attributes)
      } else {
        // Otherwise clone the new node to use as the existing node.
        var newPrev = newNode.cloneNode()
        // Copy over all existing children from the original node.
        while (oldNode.firstChild) newPrev.appendChild(oldNode.firstChild)
        // Replace the original node with the new one with the right tag.
        oldNode.parentNode.replaceChild(newPrev, oldNode)
      }
    } else {
      // Handle other types of node updates (text/comments/etc).
      // If both are the same type of node we can update directly.
      if (oldNode.nodeValue !== newNode.nodeValue) {
        oldNode.nodeValue = newNode.nodeValue
      }
    }
  } else {
    // we have to replace the node.
    dispatch(oldNode, DISMOUNT_EVENT)
    oldNode.parentNode.replaceChild(newNode, oldNode)
    dispatch(newNode, MOUNT_EVENT)
  }
}

/**
 * @private
 * @description
 * Utility that will update one list of attributes to match another.
 *
 * @param {NamedNodeMap} oldAttributes - The previous attributes.
 * @param {NamedNodeMap} newAttributes - The updated attributes.
 */
function setAttributes (oldAttributes, newAttributes) {
  var i, a, b, ns, name

  // Remove old attributes.
  for (i = oldAttributes.length; i--;) {
    a = oldAttributes[i]
    ns = a.namespaceURI
    name = a.localName
    b = newAttributes.getNamedItemNS(ns, name)
    if (!b) oldAttributes.removeNamedItemNS(ns, name)
  }

  // Set new attributes.
  for (i = newAttributes.length; i--;) {
    a = newAttributes[i]
    ns = a.namespaceURI
    name = a.localName
    b = oldAttributes.getNamedItemNS(ns, name)
    if (!b) {
      // Add a new attribute.
      newAttributes.removeNamedItemNS(ns, name)
      oldAttributes.setNamedItemNS(a)
    } else if (b.value !== a.value) {
      // Update existing attribute.
      b.value = a.value
    }
  }
}

/**
 * @private
 * @description
 * Utility that will nodes childern to match another nodes children.
 *
 * @param {Node} oldParent - The existing parent node.
 * @param {Node} newParent - The new parent node.
 */
function setChildNodes (oldParent, newParent) {
  var checkOld, oldKey, checkNew, newKey, foundNode, keyedNodes
  var oldNode = oldParent.firstChild
  var newNode = newParent.firstChild
  var extra = 0

  // Extract keyed nodes from previous children and keep track of total count.
  while (oldNode) {
    extra++
    checkOld = oldNode
    oldKey = getKey(checkOld)
    oldNode = oldNode.nextSibling

    if (oldKey) {
      if (!keyedNodes) keyedNodes = {}
      keyedNodes[oldKey] = checkOld
    }
  }

  // Loop over new nodes and perform updates.
  oldNode = oldParent.firstChild
  while (newNode) {
    extra--
    checkNew = newNode
    newNode = newNode.nextSibling

    if (keyedNodes && (newKey = getKey(checkNew)) && (foundNode = keyedNodes[newKey])) {
      // If we have a key and it existed before we move the previous node to the new position and diff it.
      oldParent.insertBefore(foundNode, oldNode)
      setNode(foundNode, checkNew)
    } else if (oldNode && !getKey(oldNode)) {
      // If there was no keys on either side we simply diff the nodes.
      checkOld = oldNode
      oldNode = oldNode.nextSibling
      setNode(checkOld, checkNew)
    } else {
      // Otherwise we append or insert the new node at the proper position.
      oldParent.insertBefore(checkNew, oldNode)
      dispatch(checkNew, MOUNT_EVENT)
    }
  }

  // If we have any remaining remove them from the end.
  while (--extra >= 0) {
    oldParent.removeChild(dispatch(oldParent.lastChild, DISMOUNT_EVENT))
  }
}

/**
 * @private
 * @description
 * Utility to try to pull a key out of an element.
 * Uses 'data-key' if possible and falls back to 'id'.
 *
 * @param {Node} node - The node to get the key for.
 * @return {string|void}
 */
function getKey (node) {
  if (node.nodeType !== ELEMENT_TYPE) return
  var key = node.getAttribute(setDOM.KEY) || node.id
  if (key) return KEY_PREFIX + key
}

/**
 * @private
 * @description
 * Utility to try to pull a checksum attribute from an element.
 * Uses 'data-checksum' or user specified checksum property.
 *
 * @param {Node} node - The node to get the checksum for.
 * @return {string|NaN}
 */
function getCheckSum (node) {
  return node.getAttribute(setDOM.CHECKSUM) || NaN
}

/**
 * @private
 * @description
 * Utility to try to check if an element should be ignored by the algorithm.
 * Uses 'data-ignore' or user specified ignore property.
 *
 * @param {Node} node - The node to check if it should be ignored.
 * @return {boolean}
 */
function isIgnored (node) {
  return node.getAttribute(setDOM.IGNORE) != null
}

/**
 * Recursively trigger an event for a node and it's children.
 * Only emits events for keyed nodes.
 *
 * @param {Node} node - the initial node.
 * @return {Node}
 */
function dispatch (node, type) {
  // Trigger event for this element if it has a key.
  if (getKey(node)) {
    var ev = document.createEvent('Event')
    var prop = { value: node }
    ev.initEvent(type, false, false)
    Object.defineProperty(ev, 'target', prop)
    Object.defineProperty(ev, 'srcElement', prop)
    node.dispatchEvent(ev)
  }

  // Dispatch to all children.
  var child = node.firstChild
  while (child) child = dispatch(child, type).nextSibling
  return node
}

/**
 * @private
 * @description
 * Confirm that a value is truthy, throws an error message otherwise.
 *
 * @param {*} val - the val to test.
 * @param {string} msg - the error message on failure.
 * @throws {Error}
 */
function assert (val, msg) {
  if (!val) throw new Error('set-dom: ' + msg)
}

},{"7":7}],7:[function(require,module,exports){
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
      console.log('parsing root', mockDoc.documentElement)
      mockDoc.documentElement.innerHTML = markup
      console.log('parsed root')
      return mockDoc.documentElement
    } else {
      mockDoc.body.innerHTML = markup
      return mockDoc.body.firstChild
    }
  }

},{}],8:[function(require,module,exports){
'use strict'

var assert = require(1)
var diff = require(6)

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

  it.only('should diff an entire document', function () {
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

},{"1":1,"6":6}]},{},[8])(8)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9wYXJzZS1odG1sLmpzIiwidGVzdC9tYWluLnRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBjb21wYXJlIGFuZCBpc0J1ZmZlciB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2Jsb2IvNjgwZTllNWU0ODhmMjJhYWMyNzU5OWE1N2RjODQ0YTYzMTU5MjhkZC9pbmRleC5qc1xuLy8gb3JpZ2luYWwgbm90aWNlOlxuXG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5mdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHZhciB4ID0gYS5sZW5ndGg7XG4gIHZhciB5ID0gYi5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV07XG4gICAgICB5ID0gYltpXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBpZiAoeSA8IHgpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuICByZXR1cm4gMDtcbn1cbmZ1bmN0aW9uIGlzQnVmZmVyKGIpIHtcbiAgaWYgKGdsb2JhbC5CdWZmZXIgJiYgdHlwZW9mIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlcihiKTtcbiAgfVxuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKTtcbn1cblxuLy8gYmFzZWQgb24gbm9kZSBhc3NlcnQsIG9yaWdpbmFsIG5vdGljZTpcblxuLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBmdW5jdGlvbnNIYXZlTmFtZXMgPSAoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZm9vKCkge30ubmFtZSA9PT0gJ2Zvbyc7XG59KCkpO1xuZnVuY3Rpb24gcFRvU3RyaW5nIChvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xufVxuZnVuY3Rpb24gaXNWaWV3KGFycmJ1Zikge1xuICBpZiAoaXNCdWZmZXIoYXJyYnVmKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZW9mIGdsb2JhbC5BcnJheUJ1ZmZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyLmlzVmlldyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBBcnJheUJ1ZmZlci5pc1ZpZXcoYXJyYnVmKTtcbiAgfVxuICBpZiAoIWFycmJ1Zikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoYXJyYnVmIGluc3RhbmNlb2YgRGF0YVZpZXcpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoYXJyYnVmLmJ1ZmZlciAmJiBhcnJidWYuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG52YXIgcmVnZXggPSAvXFxzKmZ1bmN0aW9uXFxzKyhbXlxcKFxcc10qKVxccyovO1xuLy8gYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2xqaGFyYi9mdW5jdGlvbi5wcm90b3R5cGUubmFtZS9ibG9iL2FkZWVlZWM4YmZjYzYwNjhiMTg3ZDdkOWZiM2Q1YmIxZDNhMzA4OTkvaW1wbGVtZW50YXRpb24uanNcbmZ1bmN0aW9uIGdldE5hbWUoZnVuYykge1xuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihmdW5jKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZnVuY3Rpb25zSGF2ZU5hbWVzKSB7XG4gICAgcmV0dXJuIGZ1bmMubmFtZTtcbiAgfVxuICB2YXIgc3RyID0gZnVuYy50b1N0cmluZygpO1xuICB2YXIgbWF0Y2ggPSBzdHIubWF0Y2gocmVnZXgpO1xuICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2hbMV07XG59XG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgaWYgKG9wdGlvbnMubWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBnZXRNZXNzYWdlKHRoaXMpO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH1cbiAgdmFyIHN0YWNrU3RhcnRGdW5jdGlvbiA9IG9wdGlvbnMuc3RhY2tTdGFydEZ1bmN0aW9uIHx8IGZhaWw7XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgLy8gbm9uIHY4IGJyb3dzZXJzIHNvIHdlIGNhbiBoYXZlIGEgc3RhY2t0cmFjZVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICBpZiAoZXJyLnN0YWNrKSB7XG4gICAgICB2YXIgb3V0ID0gZXJyLnN0YWNrO1xuXG4gICAgICAvLyB0cnkgdG8gc3RyaXAgdXNlbGVzcyBmcmFtZXNcbiAgICAgIHZhciBmbl9uYW1lID0gZ2V0TmFtZShzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodHlwZW9mIHMgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5mdW5jdGlvbiBpbnNwZWN0KHNvbWV0aGluZykge1xuICBpZiAoZnVuY3Rpb25zSGF2ZU5hbWVzIHx8ICF1dGlsLmlzRnVuY3Rpb24oc29tZXRoaW5nKSkge1xuICAgIHJldHVybiB1dGlsLmluc3BlY3Qoc29tZXRoaW5nKTtcbiAgfVxuICB2YXIgcmF3bmFtZSA9IGdldE5hbWUoc29tZXRoaW5nKTtcbiAgdmFyIG5hbWUgPSByYXduYW1lID8gJzogJyArIHJhd25hbWUgOiAnJztcbiAgcmV0dXJuICdbRnVuY3Rpb24nICsgIG5hbWUgKyAnXSc7XG59XG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKGluc3BlY3Qoc2VsZi5hY3R1YWwpLCAxMjgpICsgJyAnICtcbiAgICAgICAgIHNlbGYub3BlcmF0b3IgKyAnICcgK1xuICAgICAgICAgdHJ1bmNhdGUoaW5zcGVjdChzZWxmLmV4cGVjdGVkKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgZmFsc2UpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmFzc2VydC5kZWVwU3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBkZWVwU3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgdHJ1ZSkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwU3RyaWN0RXF1YWwnLCBhc3NlcnQuZGVlcFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3QsIG1lbW9zKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQnVmZmVyKGFjdHVhbCkgJiYgaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGNvbXBhcmUoYWN0dWFsLCBleHBlY3RlZCkgPT09IDA7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKChhY3R1YWwgPT09IG51bGwgfHwgdHlwZW9mIGFjdHVhbCAhPT0gJ29iamVjdCcpICYmXG4gICAgICAgICAgICAgKGV4cGVjdGVkID09PSBudWxsIHx8IHR5cGVvZiBleHBlY3RlZCAhPT0gJ29iamVjdCcpKSB7XG4gICAgcmV0dXJuIHN0cmljdCA/IGFjdHVhbCA9PT0gZXhwZWN0ZWQgOiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gSWYgYm90aCB2YWx1ZXMgYXJlIGluc3RhbmNlcyBvZiB0eXBlZCBhcnJheXMsIHdyYXAgdGhlaXIgdW5kZXJseWluZ1xuICAvLyBBcnJheUJ1ZmZlcnMgaW4gYSBCdWZmZXIgZWFjaCB0byBpbmNyZWFzZSBwZXJmb3JtYW5jZVxuICAvLyBUaGlzIG9wdGltaXphdGlvbiByZXF1aXJlcyB0aGUgYXJyYXlzIHRvIGhhdmUgdGhlIHNhbWUgdHlwZSBhcyBjaGVja2VkIGJ5XG4gIC8vIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgKGFrYSBwVG9TdHJpbmcpLiBOZXZlciBwZXJmb3JtIGJpbmFyeVxuICAvLyBjb21wYXJpc29ucyBmb3IgRmxvYXQqQXJyYXlzLCB0aG91Z2gsIHNpbmNlIGUuZy4gKzAgPT09IC0wIGJ1dCB0aGVpclxuICAvLyBiaXQgcGF0dGVybnMgYXJlIG5vdCBpZGVudGljYWwuXG4gIH0gZWxzZSBpZiAoaXNWaWV3KGFjdHVhbCkgJiYgaXNWaWV3KGV4cGVjdGVkKSAmJlxuICAgICAgICAgICAgIHBUb1N0cmluZyhhY3R1YWwpID09PSBwVG9TdHJpbmcoZXhwZWN0ZWQpICYmXG4gICAgICAgICAgICAgIShhY3R1YWwgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgfHxcbiAgICAgICAgICAgICAgIGFjdHVhbCBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkpIHtcbiAgICByZXR1cm4gY29tcGFyZShuZXcgVWludDhBcnJheShhY3R1YWwuYnVmZmVyKSxcbiAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShleHBlY3RlZC5idWZmZXIpKSA9PT0gMDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2UgaWYgKGlzQnVmZmVyKGFjdHVhbCkgIT09IGlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICBtZW1vcyA9IG1lbW9zIHx8IHthY3R1YWw6IFtdLCBleHBlY3RlZDogW119O1xuXG4gICAgdmFyIGFjdHVhbEluZGV4ID0gbWVtb3MuYWN0dWFsLmluZGV4T2YoYWN0dWFsKTtcbiAgICBpZiAoYWN0dWFsSW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAoYWN0dWFsSW5kZXggPT09IG1lbW9zLmV4cGVjdGVkLmluZGV4T2YoZXhwZWN0ZWQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9zLmFjdHVhbC5wdXNoKGFjdHVhbCk7XG4gICAgbWVtb3MuZXhwZWN0ZWQucHVzaChleHBlY3RlZCk7XG5cbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgc3RyaWN0LCBtZW1vcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgc3RyaWN0LCBhY3R1YWxWaXNpdGVkT2JqZWN0cykge1xuICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQgfHwgYiA9PT0gbnVsbCB8fCBiID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBpZiBvbmUgaXMgYSBwcmltaXRpdmUsIHRoZSBvdGhlciBtdXN0IGJlIHNhbWVcbiAgaWYgKHV0aWwuaXNQcmltaXRpdmUoYSkgfHwgdXRpbC5pc1ByaW1pdGl2ZShiKSlcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgaWYgKHN0cmljdCAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYSkgIT09IE9iamVjdC5nZXRQcm90b3R5cGVPZihiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIHZhciBhSXNBcmdzID0gaXNBcmd1bWVudHMoYSk7XG4gIHZhciBiSXNBcmdzID0gaXNBcmd1bWVudHMoYik7XG4gIGlmICgoYUlzQXJncyAmJiAhYklzQXJncykgfHwgKCFhSXNBcmdzICYmIGJJc0FyZ3MpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGFJc0FyZ3MpIHtcbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIsIHN0cmljdCk7XG4gIH1cbiAgdmFyIGthID0gb2JqZWN0S2V5cyhhKTtcbiAgdmFyIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgdmFyIGtleSwgaTtcbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT09IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBzdHJpY3QsIGFjdHVhbFZpc2l0ZWRPYmplY3RzKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gOC4gVGhlIG5vbi1lcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgZm9yIGFueSBkZWVwIGluZXF1YWxpdHkuXG4vLyBhc3NlcnQubm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdERlZXBFcXVhbCA9IGZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIGZhbHNlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG5hc3NlcnQubm90RGVlcFN0cmljdEVxdWFsID0gbm90RGVlcFN0cmljdEVxdWFsO1xuZnVuY3Rpb24gbm90RGVlcFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgdHJ1ZSkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwU3RyaWN0RXF1YWwnLCBub3REZWVwU3RyaWN0RXF1YWwpO1xuICB9XG59XG5cblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElnbm9yZS4gIFRoZSBpbnN0YW5jZW9mIGNoZWNrIGRvZXNuJ3Qgd29yayBmb3IgYXJyb3cgZnVuY3Rpb25zLlxuICB9XG5cbiAgaWYgKEVycm9yLmlzUHJvdG90eXBlT2YoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGV4cGVjdGVkLmNhbGwoe30sIGFjdHVhbCkgPT09IHRydWU7XG59XG5cbmZ1bmN0aW9uIF90cnlCbG9jayhibG9jaykge1xuICB2YXIgZXJyb3I7XG4gIHRyeSB7XG4gICAgYmxvY2soKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yID0gZTtcbiAgfVxuICByZXR1cm4gZXJyb3I7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh0eXBlb2YgYmxvY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJsb2NrXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIGV4cGVjdGVkID09PSAnc3RyaW5nJykge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICBhY3R1YWwgPSBfdHJ5QmxvY2soYmxvY2spO1xuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgdmFyIHVzZXJQcm92aWRlZE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZyc7XG4gIHZhciBpc1Vud2FudGVkRXhjZXB0aW9uID0gIXNob3VsZFRocm93ICYmIHV0aWwuaXNFcnJvcihhY3R1YWwpO1xuICB2YXIgaXNVbmV4cGVjdGVkRXhjZXB0aW9uID0gIXNob3VsZFRocm93ICYmIGFjdHVhbCAmJiAhZXhwZWN0ZWQ7XG5cbiAgaWYgKChpc1Vud2FudGVkRXhjZXB0aW9uICYmXG4gICAgICB1c2VyUHJvdmlkZWRNZXNzYWdlICYmXG4gICAgICBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkgfHxcbiAgICAgIGlzVW5leHBlY3RlZEV4Y2VwdGlvbikge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cyh0cnVlLCBibG9jaywgZXJyb3IsIG1lc3NhZ2UpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL2Vycm9yLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MoZmFsc2UsIGJsb2NrLCBlcnJvciwgbWVzc2FnZSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB0aHJvdyBlcnI7IH07XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5zZXRET00uS0VZID0gJ2RhdGEta2V5J1xuc2V0RE9NLklHTk9SRSA9ICdkYXRhLWlnbm9yZSdcbnNldERPTS5DSEVDS1NVTSA9ICdkYXRhLWNoZWNrc3VtJ1xudmFyIHBhcnNlSFRNTCA9IHJlcXVpcmUoNylcbnZhciBLRVlfUFJFRklYID0gJ19zZXQtZG9tLSdcbnZhciBOT0RFX01PVU5URUQgPSBLRVlfUFJFRklYICsgJ21vdW50ZWQnXG52YXIgTU9VTlRfRVZFTlQgPSAnbW91bnQnXG52YXIgRElTTU9VTlRfRVZFTlQgPSAnZGlzbW91bnQnXG52YXIgRUxFTUVOVF9UWVBFID0gMVxudmFyIERPQ1VNRU5UX1RZUEUgPSA5XG52YXIgRE9DVU1FTlRfRlJBR01FTlRfVFlQRSA9IDExXG5cbi8vIEV4cG9zZSBhcGkuXG5tb2R1bGUuZXhwb3J0cyA9IHNldERPTVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogVXBkYXRlcyBleGlzdGluZyBkb20gdG8gbWF0Y2ggYSBuZXcgZG9tLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gb2xkTm9kZSAtIFRoZSBodG1sIGVudGl0eSB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBuZXdOb2RlIC0gVGhlIHVwZGF0ZWQgaHRtbChlbnRpdHkpLlxuICovXG5mdW5jdGlvbiBzZXRET00gKG9sZE5vZGUsIG5ld05vZGUpIHtcbiAgLy8gRW5zdXJlIGEgcmVhbGlzaCBkb20gbm9kZSBpcyBwcm92aWRlZC5cbiAgYXNzZXJ0KG9sZE5vZGUgJiYgb2xkTm9kZS5ub2RlVHlwZSwgJ1lvdSBtdXN0IHByb3ZpZGUgYSB2YWxpZCBub2RlIHRvIHVwZGF0ZS4nKVxuXG4gIC8vIEFsaWFzIGRvY3VtZW50IGVsZW1lbnQgd2l0aCBkb2N1bWVudC5cbiAgaWYgKG9sZE5vZGUubm9kZVR5cGUgPT09IERPQ1VNRU5UX1RZUEUpIG9sZE5vZGUgPSBvbGROb2RlLmRvY3VtZW50RWxlbWVudFxuXG4gIC8vIERvY3VtZW50IEZyYWdtZW50cyBkb24ndCBoYXZlIGF0dHJpYnV0ZXMsIHNvIG5vIG5lZWQgdG8gbG9vayBhdCBjaGVja3N1bXMsIGlnbm9yZWQsIGF0dHJpYnV0ZXMsIG9yIG5vZGUgcmVwbGFjZW1lbnQuXG4gIGlmIChuZXdOb2RlLm5vZGVUeXBlID09PSBET0NVTUVOVF9GUkFHTUVOVF9UWVBFKSB7XG4gICAgLy8gU2ltcGx5IHVwZGF0ZSBhbGwgY2hpbGRyZW4gKGFuZCBzdWJjaGlsZHJlbikuXG4gICAgc2V0Q2hpbGROb2RlcyhvbGROb2RlLCBuZXdOb2RlKVxuICB9IGVsc2Uge1xuICAgIC8vIE90aGVyd2lzZSB3ZSBkaWZmIHRoZSBlbnRpcmUgb2xkIG5vZGUuXG4gICAgc2V0Tm9kZShvbGROb2RlLCB0eXBlb2YgbmV3Tm9kZSA9PT0gJ3N0cmluZydcbiAgICAgIC8vIElmIGEgc3RyaW5nIHdhcyBwcm92aWRlZCB3ZSB3aWxsIHBhcnNlIGl0IGFzIGRvbS5cbiAgICAgID8gcGFyc2VIVE1MKG5ld05vZGUsIG9sZE5vZGUubm9kZU5hbWUpXG4gICAgICA6IG5ld05vZGVcbiAgICApXG4gIH1cblxuICAvLyBUcmlnZ2VyIG1vdW50IGV2ZW50cyBvbiBpbml0aWFsIHNldC5cbiAgaWYgKCFvbGROb2RlW05PREVfTU9VTlRFRF0pIHtcbiAgICBvbGROb2RlW05PREVfTU9VTlRFRF0gPSB0cnVlXG4gICAgZGlzcGF0Y2gob2xkTm9kZSwgTU9VTlRfRVZFTlQpXG4gIH1cbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQGRlc2NyaXB0aW9uXG4gKiBVcGRhdGVzIGEgc3BlY2lmaWMgaHRtbE5vZGUgYW5kIGRvZXMgd2hhdGV2ZXIgaXQgdGFrZXMgdG8gY29udmVydCBpdCB0byBhbm90aGVyIG9uZS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG9sZE5vZGUgLSBUaGUgcHJldmlvdXMgSFRNTE5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IG5ld05vZGUgLSBUaGUgdXBkYXRlZCBIVE1MTm9kZS5cbiAqL1xuZnVuY3Rpb24gc2V0Tm9kZSAob2xkTm9kZSwgbmV3Tm9kZSkge1xuICBpZiAob2xkTm9kZS5ub2RlVHlwZSA9PT0gbmV3Tm9kZS5ub2RlVHlwZSkge1xuICAgIC8vIEhhbmRsZSByZWd1bGFyIGVsZW1lbnQgbm9kZSB1cGRhdGVzLlxuICAgIGlmIChvbGROb2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX1RZUEUpIHtcbiAgICAgIC8vIElnbm9yZSBlbGVtZW50cyBpZiB0aGVpciBjaGVja3N1bSBtYXRjaGVzLlxuICAgICAgaWYgKGdldENoZWNrU3VtKG9sZE5vZGUpID09PSBnZXRDaGVja1N1bShuZXdOb2RlKSkgcmV0dXJuXG4gICAgICAvLyBJZ25vcmUgZWxlbWVudHMgdGhhdCBleHBsaWNpdHkgY2hvb3NlIG5vdCB0byBiZSBkaWZmZWQuXG4gICAgICBpZiAoaXNJZ25vcmVkKG9sZE5vZGUpICYmIGlzSWdub3JlZChuZXdOb2RlKSkgcmV0dXJuXG5cbiAgICAgIC8vIFVwZGF0ZSBhbGwgY2hpbGRyZW4gKGFuZCBzdWJjaGlsZHJlbikuXG4gICAgICBzZXRDaGlsZE5vZGVzKG9sZE5vZGUsIG5ld05vZGUpXG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZWxlbWVudHMgYXR0cmlidXRlcyAvIHRhZ05hbWUuXG4gICAgICBpZiAob2xkTm9kZS5ub2RlTmFtZSA9PT0gbmV3Tm9kZS5ub2RlTmFtZSkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIHRoZSBzYW1lIG5vZGVuYW1lIHRoZW4gd2UgY2FuIGRpcmVjdGx5IHVwZGF0ZSB0aGUgYXR0cmlidXRlcy5cbiAgICAgICAgc2V0QXR0cmlidXRlcyhvbGROb2RlLmF0dHJpYnV0ZXMsIG5ld05vZGUuYXR0cmlidXRlcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSBjbG9uZSB0aGUgbmV3IG5vZGUgdG8gdXNlIGFzIHRoZSBleGlzdGluZyBub2RlLlxuICAgICAgICB2YXIgbmV3UHJldiA9IG5ld05vZGUuY2xvbmVOb2RlKClcbiAgICAgICAgLy8gQ29weSBvdmVyIGFsbCBleGlzdGluZyBjaGlsZHJlbiBmcm9tIHRoZSBvcmlnaW5hbCBub2RlLlxuICAgICAgICB3aGlsZSAob2xkTm9kZS5maXJzdENoaWxkKSBuZXdQcmV2LmFwcGVuZENoaWxkKG9sZE5vZGUuZmlyc3RDaGlsZClcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgb3JpZ2luYWwgbm9kZSB3aXRoIHRoZSBuZXcgb25lIHdpdGggdGhlIHJpZ2h0IHRhZy5cbiAgICAgICAgb2xkTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdQcmV2LCBvbGROb2RlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIYW5kbGUgb3RoZXIgdHlwZXMgb2Ygbm9kZSB1cGRhdGVzICh0ZXh0L2NvbW1lbnRzL2V0YykuXG4gICAgICAvLyBJZiBib3RoIGFyZSB0aGUgc2FtZSB0eXBlIG9mIG5vZGUgd2UgY2FuIHVwZGF0ZSBkaXJlY3RseS5cbiAgICAgIGlmIChvbGROb2RlLm5vZGVWYWx1ZSAhPT0gbmV3Tm9kZS5ub2RlVmFsdWUpIHtcbiAgICAgICAgb2xkTm9kZS5ub2RlVmFsdWUgPSBuZXdOb2RlLm5vZGVWYWx1ZVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyB3ZSBoYXZlIHRvIHJlcGxhY2UgdGhlIG5vZGUuXG4gICAgZGlzcGF0Y2gob2xkTm9kZSwgRElTTU9VTlRfRVZFTlQpXG4gICAgb2xkTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBvbGROb2RlKVxuICAgIGRpc3BhdGNoKG5ld05vZGUsIE1PVU5UX0VWRU5UKVxuICB9XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBkZXNjcmlwdGlvblxuICogVXRpbGl0eSB0aGF0IHdpbGwgdXBkYXRlIG9uZSBsaXN0IG9mIGF0dHJpYnV0ZXMgdG8gbWF0Y2ggYW5vdGhlci5cbiAqXG4gKiBAcGFyYW0ge05hbWVkTm9kZU1hcH0gb2xkQXR0cmlidXRlcyAtIFRoZSBwcmV2aW91cyBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtOYW1lZE5vZGVNYXB9IG5ld0F0dHJpYnV0ZXMgLSBUaGUgdXBkYXRlZCBhdHRyaWJ1dGVzLlxuICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzIChvbGRBdHRyaWJ1dGVzLCBuZXdBdHRyaWJ1dGVzKSB7XG4gIHZhciBpLCBhLCBiLCBucywgbmFtZVxuXG4gIC8vIFJlbW92ZSBvbGQgYXR0cmlidXRlcy5cbiAgZm9yIChpID0gb2xkQXR0cmlidXRlcy5sZW5ndGg7IGktLTspIHtcbiAgICBhID0gb2xkQXR0cmlidXRlc1tpXVxuICAgIG5zID0gYS5uYW1lc3BhY2VVUklcbiAgICBuYW1lID0gYS5sb2NhbE5hbWVcbiAgICBiID0gbmV3QXR0cmlidXRlcy5nZXROYW1lZEl0ZW1OUyhucywgbmFtZSlcbiAgICBpZiAoIWIpIG9sZEF0dHJpYnV0ZXMucmVtb3ZlTmFtZWRJdGVtTlMobnMsIG5hbWUpXG4gIH1cblxuICAvLyBTZXQgbmV3IGF0dHJpYnV0ZXMuXG4gIGZvciAoaSA9IG5ld0F0dHJpYnV0ZXMubGVuZ3RoOyBpLS07KSB7XG4gICAgYSA9IG5ld0F0dHJpYnV0ZXNbaV1cbiAgICBucyA9IGEubmFtZXNwYWNlVVJJXG4gICAgbmFtZSA9IGEubG9jYWxOYW1lXG4gICAgYiA9IG9sZEF0dHJpYnV0ZXMuZ2V0TmFtZWRJdGVtTlMobnMsIG5hbWUpXG4gICAgaWYgKCFiKSB7XG4gICAgICAvLyBBZGQgYSBuZXcgYXR0cmlidXRlLlxuICAgICAgbmV3QXR0cmlidXRlcy5yZW1vdmVOYW1lZEl0ZW1OUyhucywgbmFtZSlcbiAgICAgIG9sZEF0dHJpYnV0ZXMuc2V0TmFtZWRJdGVtTlMoYSlcbiAgICB9IGVsc2UgaWYgKGIudmFsdWUgIT09IGEudmFsdWUpIHtcbiAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyBhdHRyaWJ1dGUuXG4gICAgICBiLnZhbHVlID0gYS52YWx1ZVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAZGVzY3JpcHRpb25cbiAqIFV0aWxpdHkgdGhhdCB3aWxsIG5vZGVzIGNoaWxkZXJuIHRvIG1hdGNoIGFub3RoZXIgbm9kZXMgY2hpbGRyZW4uXG4gKlxuICogQHBhcmFtIHtOb2RlfSBvbGRQYXJlbnQgLSBUaGUgZXhpc3RpbmcgcGFyZW50IG5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IG5ld1BhcmVudCAtIFRoZSBuZXcgcGFyZW50IG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHNldENoaWxkTm9kZXMgKG9sZFBhcmVudCwgbmV3UGFyZW50KSB7XG4gIHZhciBjaGVja09sZCwgb2xkS2V5LCBjaGVja05ldywgbmV3S2V5LCBmb3VuZE5vZGUsIGtleWVkTm9kZXNcbiAgdmFyIG9sZE5vZGUgPSBvbGRQYXJlbnQuZmlyc3RDaGlsZFxuICB2YXIgbmV3Tm9kZSA9IG5ld1BhcmVudC5maXJzdENoaWxkXG4gIHZhciBleHRyYSA9IDBcblxuICAvLyBFeHRyYWN0IGtleWVkIG5vZGVzIGZyb20gcHJldmlvdXMgY2hpbGRyZW4gYW5kIGtlZXAgdHJhY2sgb2YgdG90YWwgY291bnQuXG4gIHdoaWxlIChvbGROb2RlKSB7XG4gICAgZXh0cmErK1xuICAgIGNoZWNrT2xkID0gb2xkTm9kZVxuICAgIG9sZEtleSA9IGdldEtleShjaGVja09sZClcbiAgICBvbGROb2RlID0gb2xkTm9kZS5uZXh0U2libGluZ1xuXG4gICAgaWYgKG9sZEtleSkge1xuICAgICAgaWYgKCFrZXllZE5vZGVzKSBrZXllZE5vZGVzID0ge31cbiAgICAgIGtleWVkTm9kZXNbb2xkS2V5XSA9IGNoZWNrT2xkXG4gICAgfVxuICB9XG5cbiAgLy8gTG9vcCBvdmVyIG5ldyBub2RlcyBhbmQgcGVyZm9ybSB1cGRhdGVzLlxuICBvbGROb2RlID0gb2xkUGFyZW50LmZpcnN0Q2hpbGRcbiAgd2hpbGUgKG5ld05vZGUpIHtcbiAgICBleHRyYS0tXG4gICAgY2hlY2tOZXcgPSBuZXdOb2RlXG4gICAgbmV3Tm9kZSA9IG5ld05vZGUubmV4dFNpYmxpbmdcblxuICAgIGlmIChrZXllZE5vZGVzICYmIChuZXdLZXkgPSBnZXRLZXkoY2hlY2tOZXcpKSAmJiAoZm91bmROb2RlID0ga2V5ZWROb2Rlc1tuZXdLZXldKSkge1xuICAgICAgLy8gSWYgd2UgaGF2ZSBhIGtleSBhbmQgaXQgZXhpc3RlZCBiZWZvcmUgd2UgbW92ZSB0aGUgcHJldmlvdXMgbm9kZSB0byB0aGUgbmV3IHBvc2l0aW9uIGFuZCBkaWZmIGl0LlxuICAgICAgb2xkUGFyZW50Lmluc2VydEJlZm9yZShmb3VuZE5vZGUsIG9sZE5vZGUpXG4gICAgICBzZXROb2RlKGZvdW5kTm9kZSwgY2hlY2tOZXcpXG4gICAgfSBlbHNlIGlmIChvbGROb2RlICYmICFnZXRLZXkob2xkTm9kZSkpIHtcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBubyBrZXlzIG9uIGVpdGhlciBzaWRlIHdlIHNpbXBseSBkaWZmIHRoZSBub2Rlcy5cbiAgICAgIGNoZWNrT2xkID0gb2xkTm9kZVxuICAgICAgb2xkTm9kZSA9IG9sZE5vZGUubmV4dFNpYmxpbmdcbiAgICAgIHNldE5vZGUoY2hlY2tPbGQsIGNoZWNrTmV3KVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPdGhlcndpc2Ugd2UgYXBwZW5kIG9yIGluc2VydCB0aGUgbmV3IG5vZGUgYXQgdGhlIHByb3BlciBwb3NpdGlvbi5cbiAgICAgIG9sZFBhcmVudC5pbnNlcnRCZWZvcmUoY2hlY2tOZXcsIG9sZE5vZGUpXG4gICAgICBkaXNwYXRjaChjaGVja05ldywgTU9VTlRfRVZFTlQpXG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgaGF2ZSBhbnkgcmVtYWluaW5nIHJlbW92ZSB0aGVtIGZyb20gdGhlIGVuZC5cbiAgd2hpbGUgKC0tZXh0cmEgPj0gMCkge1xuICAgIG9sZFBhcmVudC5yZW1vdmVDaGlsZChkaXNwYXRjaChvbGRQYXJlbnQubGFzdENoaWxkLCBESVNNT1VOVF9FVkVOVCkpXG4gIH1cbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQGRlc2NyaXB0aW9uXG4gKiBVdGlsaXR5IHRvIHRyeSB0byBwdWxsIGEga2V5IG91dCBvZiBhbiBlbGVtZW50LlxuICogVXNlcyAnZGF0YS1rZXknIGlmIHBvc3NpYmxlIGFuZCBmYWxscyBiYWNrIHRvICdpZCcuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlIC0gVGhlIG5vZGUgdG8gZ2V0IHRoZSBrZXkgZm9yLlxuICogQHJldHVybiB7c3RyaW5nfHZvaWR9XG4gKi9cbmZ1bmN0aW9uIGdldEtleSAobm9kZSkge1xuICBpZiAobm9kZS5ub2RlVHlwZSAhPT0gRUxFTUVOVF9UWVBFKSByZXR1cm5cbiAgdmFyIGtleSA9IG5vZGUuZ2V0QXR0cmlidXRlKHNldERPTS5LRVkpIHx8IG5vZGUuaWRcbiAgaWYgKGtleSkgcmV0dXJuIEtFWV9QUkVGSVggKyBrZXlcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQGRlc2NyaXB0aW9uXG4gKiBVdGlsaXR5IHRvIHRyeSB0byBwdWxsIGEgY2hlY2tzdW0gYXR0cmlidXRlIGZyb20gYW4gZWxlbWVudC5cbiAqIFVzZXMgJ2RhdGEtY2hlY2tzdW0nIG9yIHVzZXIgc3BlY2lmaWVkIGNoZWNrc3VtIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAtIFRoZSBub2RlIHRvIGdldCB0aGUgY2hlY2tzdW0gZm9yLlxuICogQHJldHVybiB7c3RyaW5nfE5hTn1cbiAqL1xuZnVuY3Rpb24gZ2V0Q2hlY2tTdW0gKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKHNldERPTS5DSEVDS1NVTSkgfHwgTmFOXG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBkZXNjcmlwdGlvblxuICogVXRpbGl0eSB0byB0cnkgdG8gY2hlY2sgaWYgYW4gZWxlbWVudCBzaG91bGQgYmUgaWdub3JlZCBieSB0aGUgYWxnb3JpdGhtLlxuICogVXNlcyAnZGF0YS1pZ25vcmUnIG9yIHVzZXIgc3BlY2lmaWVkIGlnbm9yZSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgLSBUaGUgbm9kZSB0byBjaGVjayBpZiBpdCBzaG91bGQgYmUgaWdub3JlZC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzSWdub3JlZCAobm9kZSkge1xuICByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoc2V0RE9NLklHTk9SRSkgIT0gbnVsbFxufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHRyaWdnZXIgYW4gZXZlbnQgZm9yIGEgbm9kZSBhbmQgaXQncyBjaGlsZHJlbi5cbiAqIE9ubHkgZW1pdHMgZXZlbnRzIGZvciBrZXllZCBub2Rlcy5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgLSB0aGUgaW5pdGlhbCBub2RlLlxuICogQHJldHVybiB7Tm9kZX1cbiAqL1xuZnVuY3Rpb24gZGlzcGF0Y2ggKG5vZGUsIHR5cGUpIHtcbiAgLy8gVHJpZ2dlciBldmVudCBmb3IgdGhpcyBlbGVtZW50IGlmIGl0IGhhcyBhIGtleS5cbiAgaWYgKGdldEtleShub2RlKSkge1xuICAgIHZhciBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gICAgdmFyIHByb3AgPSB7IHZhbHVlOiBub2RlIH1cbiAgICBldi5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShldiwgJ3RhcmdldCcsIHByb3ApXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2LCAnc3JjRWxlbWVudCcsIHByb3ApXG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2KVxuICB9XG5cbiAgLy8gRGlzcGF0Y2ggdG8gYWxsIGNoaWxkcmVuLlxuICB2YXIgY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGRcbiAgd2hpbGUgKGNoaWxkKSBjaGlsZCA9IGRpc3BhdGNoKGNoaWxkLCB0eXBlKS5uZXh0U2libGluZ1xuICByZXR1cm4gbm9kZVxufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpcm0gdGhhdCBhIHZhbHVlIGlzIHRydXRoeSwgdGhyb3dzIGFuIGVycm9yIG1lc3NhZ2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsIC0gdGhlIHZhbCB0byB0ZXN0LlxuICogQHBhcmFtIHtzdHJpbmd9IG1zZyAtIHRoZSBlcnJvciBtZXNzYWdlIG9uIGZhaWx1cmUuXG4gKiBAdGhyb3dzIHtFcnJvcn1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0ICh2YWwsIG1zZykge1xuICBpZiAoIXZhbCkgdGhyb3cgbmV3IEVycm9yKCdzZXQtZG9tOiAnICsgbXNnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBwYXJzZXIgPSB3aW5kb3cuRE9NUGFyc2VyICYmIG5ldyB3aW5kb3cuRE9NUGFyc2VyKClcbnZhciBkb2N1bWVudFJvb3ROYW1lID0gJ0hUTUwnXG52YXIgc3VwcG9ydHNIVE1MVHlwZSA9IGZhbHNlXG52YXIgaHRtbFR5cGUgPSAndGV4dC9odG1sJ1xudmFyIHRlc3RDb2RlID0gJzxici8+J1xudmFyIG1vY2tEb2MgPSBudWxsXG5cbi8vIENoZWNrIGlmIGJyb3dzZXIgc3VwcG9ydHMgdGV4dC9odG1sIERPTVBhcnNlclxudHJ5IHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQ6IEZhaWxzIGluIG9sZGVyIGJyb3dzZXJzICovXG4gIGlmIChwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRlc3RDb2RlLCBodG1sVHlwZSkpIHN1cHBvcnRzSFRNTFR5cGUgPSB0cnVlXG59IGNhdGNoIChlcnIpIHt9XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVzdWx0cyBvZiBhIERPTVBhcnNlciBhcyBhbiBIVE1MRWxlbWVudC5cbiAqIChTaGltcyBmb3Igb2xkZXIgYnJvd3NlcnMpLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzSFRNTFR5cGVcbiAgPyBmdW5jdGlvbiBwYXJzZUhUTUwgKG1hcmt1cCwgcm9vdE5hbWUpIHtcbiAgICB2YXIgZG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhtYXJrdXAsIGh0bWxUeXBlKVxuICAgIHJldHVybiByb290TmFtZSA9PT0gZG9jdW1lbnRSb290TmFtZVxuICAgICAgPyBkb2MuZG9jdW1lbnRFbGVtZW50XG4gICAgICA6IGRvYy5ib2R5LmZpcnN0Q2hpbGRcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogT25seSB1c2VkIGluIG9sZGVyIGJyb3dzZXJzICovXG4gIDogZnVuY3Rpb24gcGFyc2VIVE1MIChtYXJrdXAsIHJvb3ROYW1lKSB7XG4gICAgLy8gRmFsbGJhY2sgdG8gaW5uZXJIVE1MIGZvciBvdGhlciBvbGRlciBicm93c2Vycy5cbiAgICBtb2NrRG9jID0gbW9ja0RvYyB8fCBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJycpXG4gICAgaWYgKHJvb3ROYW1lID09PSBkb2N1bWVudFJvb3ROYW1lKSB7XG4gICAgICBjb25zb2xlLmxvZygncGFyc2luZyByb290JywgbW9ja0RvYy5kb2N1bWVudEVsZW1lbnQpXG4gICAgICBtb2NrRG9jLmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUwgPSBtYXJrdXBcbiAgICAgIGNvbnNvbGUubG9nKCdwYXJzZWQgcm9vdCcpXG4gICAgICByZXR1cm4gbW9ja0RvYy5kb2N1bWVudEVsZW1lbnRcbiAgICB9IGVsc2Uge1xuICAgICAgbW9ja0RvYy5ib2R5LmlubmVySFRNTCA9IG1hcmt1cFxuICAgICAgcmV0dXJuIG1vY2tEb2MuYm9keS5maXJzdENoaWxkXG4gICAgfVxuICB9XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGFzc2VydCA9IHJlcXVpcmUoMSlcbnZhciBkaWZmID0gcmVxdWlyZSg2KVxuXG5kZXNjcmliZSgnU2V0LURPTScsIGZ1bmN0aW9uICgpIHtcbiAgaXQoJ3Nob3VsZCBlcnJvciB3aXRoIGludmFsaWQgYXJndW1lbnRzJywgZnVuY3Rpb24gKCkge1xuICAgIGFzc2VydC50aHJvd3MoZnVuY3Rpb24gKCkge1xuICAgICAgZGlmZignaGVsbG8gd29ybGQnLCAnc29tZXRoaW5nIGVsc2UnKVxuICAgIH0sIEVycm9yKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBhdHRyaWJ1dGVzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGF0dHJpYnV0ZS5cbiAgICBlbDIuc2V0QXR0cmlidXRlKCdhJywgJzEnKVxuICAgIGVsMi5zZXRBdHRyaWJ1dGUoJ2InLCAnMicpXG4gICAgZGlmZihlbDEsIGVsMilcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmdldEF0dHJpYnV0ZSgnYScpLCAnMScsICd1cGRhdGUgYXR0cmlidXRlJylcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmdldEF0dHJpYnV0ZSgnYicpLCAnMicsICd1cGRhdGUgYXR0cmlidXRlJylcblxuICAgIC8vIFJlbW92ZSBhdHRyaWJ1dGUuXG4gICAgZWwyLnJlbW92ZUF0dHJpYnV0ZSgnYScpXG4gICAgZGlmZihlbDEsIGVsMilcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmdldEF0dHJpYnV0ZSgnYScpLCBudWxsLCAncmVtb3ZlIGF0dHJpYnV0ZScpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIG5vZGVWYWx1ZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciB0ZXh0XG4gICAgZWwxLmlubmVySFRNTCA9ICdoZWxsbyB3b3JsZCdcbiAgICBlbDIuaW5uZXJIVE1MID0gJ2hlbGxvIHdvcmxkIDInXG4gICAgZGlmZihlbDEsIGVsMilcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmZpcnN0Q2hpbGQubm9kZVZhbHVlLCAnaGVsbG8gd29ybGQgMicsICd1cGRhdGUgbm9kZXZhbHVlJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgbm9kZVR5cGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdmFyIGVsMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdmFyIGVsMiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdoZWxsbyB3b3JsZCcpXG4gICAgZWwxLmlkID0gJ3Rlc3QnXG4gICAgZWwyLmlkID0gJ3Rlc3QnXG5cbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZWwxKVxuICAgIGRpZmYoZWwxLCBlbDIpXG5cbiAgICBhc3NlcnQuZXF1YWwocGFyZW50LmZpcnN0Q2hpbGQubm9kZVR5cGUsIGVsMi5ub2RlVHlwZSwgJ3Nob3VsZCBoYXZlIHVwZGF0ZWQgbm9kZSB0eXBlJylcbiAgICBhc3NlcnQuZXF1YWwocGFyZW50LmZpcnN0Q2hpbGQubm9kZVZhbHVlLCBlbDIubm9kZVZhbHVlLCAnc2hvdWxkIGhhdmUgdXBkYXRlZCBub2RlIHZhbHVlJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgY2hpbGRyZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdmFyIGVsMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICAvLyBVcGRhdGUgaW5uZXIgaHRtbFxuICAgIGVsMS5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmtcIj5oZWxsbzwvYT48Yj50ZXh0PC9iPjxpPnRleHQyPC9pPidcbiAgICBlbDIuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rMlwiPmhlbGxvMjwvYT48aT50ZXh0MTwvaT4nXG4gICAgdmFyIG9yaWdpbmFsRmlyc3RDaGlsZCA9IGVsMS5maXJzdENoaWxkXG4gICAgZGlmZihlbDEsIGVsMilcblxuICAgIGFzc2VydC5lcXVhbChlbDEub3V0ZXJIVE1MLCAnPGRpdj48YSBocmVmPVwibGluazJcIj5oZWxsbzI8L2E+PGk+dGV4dDE8L2k+PC9kaXY+JywgJ3VwZGF0ZSBjaGlsZHJlbiBpbm5lcmh0bWwnKVxuICAgIC8vIEVuc3VyZSB0aGF0IG90aGVyIHdhcyBub3QgZGlzY2FyZGVkLlxuICAgIGFzc2VydC5lcXVhbChlbDEuZmlyc3RDaGlsZCwgb3JpZ2luYWxGaXJzdENoaWxkLCAncHJlc2VydmVkIGNoaWxkcmVuJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgY2hpbGRyZW4gd2l0aCBzcGFjZXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdmFyIGVsMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICAvLyBVcGRhdGUgaW5uZXIgaHRtbFxuICAgIGVsMS5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmtcIj5oZWxsbzwvYT4gPGI+dGV4dDwvYj4gPGk+dGV4dDI8L2k+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPjxpPnRleHQxPC9pPidcbiAgICB2YXIgb3JpZ2luYWxGaXJzdENoaWxkID0gZWwxLmZpcnN0Q2hpbGRcbiAgICBkaWZmKGVsMSwgZWwyKVxuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5vdXRlckhUTUwsICc8ZGl2PjxhIGhyZWY9XCJsaW5rMlwiPmhlbGxvMjwvYT48aT50ZXh0MTwvaT48L2Rpdj4nLCAndXBkYXRlIGNoaWxkcmVuIGlubmVyaHRtbCcpXG4gICAgLy8gRW5zdXJlIHRoYXQgb3RoZXIgd2FzIG5vdCBkaXNjYXJkZWQuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5maXJzdENoaWxkLCBvcmlnaW5hbEZpcnN0Q2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBjaGlsZHJlbiAoaWQpJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGI+dGV4dDwvYj48aSBpZD1cInRlc3RcIj50ZXh0MjwvaT4nXG4gICAgZWwyLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGluazJcIj5oZWxsbzI8L2E+PGkgaWQ9XCJ0ZXN0XCI+dGV4dDE8L2k+J1xuICAgIHZhciBvcmlnaW5hbEZpcnN0Q2hpbGQgPSBlbDEuZmlyc3RDaGlsZFxuICAgIHZhciBvcmlnaW5hbExhc3RDaGlsZCA9IGVsMS5sYXN0Q2hpbGRcbiAgICBkaWZmKGVsMSwgZWwyKVxuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5vdXRlckhUTUwsICc8ZGl2PjxhIGhyZWY9XCJsaW5rMlwiPmhlbGxvMjwvYT48aSBpZD1cInRlc3RcIj50ZXh0MTwvaT48L2Rpdj4nLCAndXBkYXRlIGNoaWxkcmVuIGlubmVyaHRtbCcpXG4gICAgLy8gRW5zdXJlIHRoYXQgb3RoZXIgd2FzIG5vdCBkaXNjYXJkZWQuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5maXJzdENoaWxkLCBvcmlnaW5hbEZpcnN0Q2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICAgIGFzc2VydC5lcXVhbChlbDEubGFzdENoaWxkLCBvcmlnaW5hbExhc3RDaGlsZCwgJ3ByZXNlcnZlZCBjaGlsZHJlbicpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIGNoaWxkcmVuIChkYXRhLWtleSkgbW92ZSBieSBkZWxldGluZycsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciBodG1sXG4gICAgZWwxLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGlua1wiPmhlbGxvPC9hPjxiPnRleHQ8L2I+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPjxpIGRhdGEta2V5PVwidGVzdFwiPnRleHQxPC9pPidcbiAgICB2YXIgb3JpZ2luYWxGaXJzdENoaWxkID0gZWwxLmZpcnN0Q2hpbGRcbiAgICB2YXIgb3JpZ2luYWxMYXN0Q2hpbGQgPSBlbDEubGFzdENoaWxkXG4gICAgZGlmZihlbDEsIGVsMilcblxuICAgIGFzc2VydC5lcXVhbChlbDEub3V0ZXJIVE1MLCAnPGRpdj48YSBocmVmPVwibGluazJcIj5oZWxsbzI8L2E+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDE8L2k+PC9kaXY+JywgJ3VwZGF0ZSBjaGlsZHJlbiBpbm5lcmh0bWwnKVxuICAgIC8vIEVuc3VyZSB0aGF0IG90aGVyIHdhcyBub3QgZGlzY2FyZGVkLlxuICAgIGFzc2VydC5lcXVhbChlbDEuZmlyc3RDaGlsZCwgb3JpZ2luYWxGaXJzdENoaWxkLCAncHJlc2VydmVkIGNoaWxkcmVuJylcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmxhc3RDaGlsZCwgb3JpZ2luYWxMYXN0Q2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBjaGlsZHJlbiAoZGF0YS1rZXkpIG1vdmUgYnkgc2h1ZmZsaW5nJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGIgZGF0YS1rZXk9XCJ0ZXN0MVwiPnRleHQ8L2I+PGkgZGF0YS1rZXk9XCJ0ZXN0MlwiPnRleHQyPC9pPidcbiAgICBlbDIuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGkgZGF0YS1rZXk9XCJ0ZXN0MlwiPnRleHQyPC9pPjxiIGRhdGEta2V5PVwidGVzdDFcIj50ZXh0PC9iPidcbiAgICB2YXIgb3JpZ2luYWxTZWNvbmRDaGlsZCA9IGVsMS5jaGlsZE5vZGVzWzFdXG4gICAgdmFyIG9yaWdpbmFsVGhpcmRDaGlsZCA9IGVsMS5jaGlsZE5vZGVzWzJdXG4gICAgZGlmZihlbDEsIGVsMilcblxuICAgIGFzc2VydC5lcXVhbChlbDEuaW5uZXJIVE1MLCAnPGEgaHJlZj1cImxpbmtcIj5oZWxsbzwvYT48aSBkYXRhLWtleT1cInRlc3QyXCI+dGV4dDI8L2k+PGIgZGF0YS1rZXk9XCJ0ZXN0MVwiPnRleHQ8L2I+JywgJ21vdmUgY2hpbGRyZW4nKVxuICAgIC8vIEVuc3VyZSB0aGF0IG90aGVyIHdhcyBub3QgZGlzY2FyZGVkLlxuICAgIGFzc2VydC5lcXVhbChlbDEuY2hpbGROb2Rlc1sxXSwgb3JpZ2luYWxUaGlyZENoaWxkLCAncHJlc2VydmVkIGNoaWxkcmVuJylcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmNoaWxkTm9kZXNbMl0sIG9yaWdpbmFsU2Vjb25kQ2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBjaGlsZHJlbiAoZGF0YS1rZXkpIHJlbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciBodG1sXG4gICAgZWwxLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGlua1wiPmhlbGxvPC9hPjxiPnRleHQ8L2I+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPidcbiAgICB2YXIgb3JpZ2luYWxGaXJzdENoaWxkID0gZWwxLmZpcnN0Q2hpbGRcbiAgICBkaWZmKGVsMSwgZWwyKVxuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5vdXRlckhUTUwsICc8ZGl2PjxhIGhyZWY9XCJsaW5rMlwiPmhlbGxvMjwvYT48L2Rpdj4nLCAndXBkYXRlIGNoaWxkcmVuIGlubmVyaHRtbCcpXG4gICAgLy8gRW5zdXJlIHRoYXQgb3RoZXIgd2FzIG5vdCBkaXNjYXJkZWQuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5maXJzdENoaWxkLCBvcmlnaW5hbEZpcnN0Q2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBjaGlsZHJlbiAoZGF0YS1rZXkpIGluc2VydCBuZXcga2V5JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGI+dGV4dDwvYj4nXG4gICAgZWwyLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGluazJcIj5oZWxsbzI8L2E+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+J1xuICAgIHZhciBvcmlnaW5hbEZpcnN0Q2hpbGQgPSBlbDEuZmlyc3RDaGlsZFxuICAgIGRpZmYoZWwxLCBlbDIpXG5cbiAgICBhc3NlcnQuZXF1YWwoZWwxLm91dGVySFRNTCwgJzxkaXY+PGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPjxpIGRhdGEta2V5PVwidGVzdFwiPnRleHQyPC9pPjwvZGl2PicsICd1cGRhdGUgY2hpbGRyZW4gaW5uZXJodG1sJylcbiAgICAvLyBFbnN1cmUgdGhhdCBvdGhlciB3YXMgbm90IGRpc2NhcmRlZC5cbiAgICBhc3NlcnQuZXF1YWwoZWwxLmZpcnN0Q2hpbGQsIG9yaWdpbmFsRmlyc3RDaGlsZCwgJ3ByZXNlcnZlZCBjaGlsZHJlbicpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIGNoaWxkcmVuIChkYXRhLWtleSkgaW5zZXJ0IG5ldyBub2RlJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPjxiPnRlc3Q8L2I+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+J1xuICAgIHZhciBvcmlnaW5hbEZpcnN0Q2hpbGQgPSBlbDEuZmlyc3RDaGlsZFxuICAgIGRpZmYoZWwxLCBlbDIpXG5cbiAgICBhc3NlcnQuZXF1YWwoZWwxLm91dGVySFRNTCwgJzxkaXY+PGEgaHJlZj1cImxpbmsyXCI+aGVsbG8yPC9hPjxiPnRlc3Q8L2I+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDI8L2k+PC9kaXY+JywgJ3VwZGF0ZSBjaGlsZHJlbiBpbm5lcmh0bWwnKVxuICAgIC8vIEVuc3VyZSB0aGF0IG90aGVyIHdhcyBub3QgZGlzY2FyZGVkLlxuICAgIGFzc2VydC5lcXVhbChlbDEuZmlyc3RDaGlsZCwgb3JpZ2luYWxGaXJzdENoaWxkLCAncHJlc2VydmVkIGNoaWxkcmVuJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgY2hpbGRyZW4gKGRhdGEta2V5KSB3aXRoIHhodG1sIG5hbWVzcGFjZVVSSScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgJ2RpdicpXG4gICAgdmFyIGVsMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsICdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxhIGhyZWY9XCJsaW5rXCI+aGVsbG88L2E+PGI+dGV4dDwvYj48aSBkYXRhLWtleT1cInRlc3RcIj50ZXh0MjwvaT4nXG4gICAgZWwyLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGluazJcIj5oZWxsbzI8L2E+PGkgZGF0YS1rZXk9XCJ0ZXN0XCI+dGV4dDE8L2k+J1xuICAgIHZhciBvcmlnaW5hbEZpcnN0Q2hpbGQgPSBlbDEuZmlyc3RDaGlsZFxuICAgIHZhciBvcmlnaW5hbExhc3RDaGlsZCA9IGVsMS5sYXN0Q2hpbGRcbiAgICBkaWZmKGVsMSwgZWwyKVxuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5vdXRlckhUTUwsICc8ZGl2PjxhIGhyZWY9XCJsaW5rMlwiPmhlbGxvMjwvYT48aSBkYXRhLWtleT1cInRlc3RcIj50ZXh0MTwvaT48L2Rpdj4nLCAndXBkYXRlIGNoaWxkcmVuIGlubmVyaHRtbCcpXG4gICAgLy8gRW5zdXJlIHRoYXQgb3RoZXIgd2FzIG5vdCBkaXNjYXJkZWQuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5maXJzdENoaWxkLCBvcmlnaW5hbEZpcnN0Q2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICAgIGFzc2VydC5lcXVhbChlbDEubGFzdENoaWxkLCBvcmlnaW5hbExhc3RDaGlsZCwgJ3ByZXNlcnZlZCBjaGlsZHJlbicpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIGNoaWxkcmVuIChkYXRhLWtleSkgbW92ZSAoY3VzdG9tIGF0dHJpYnV0ZSknLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdmFyIGVsMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICAvLyBTZXQgY3VzdG9tIGtleSBhdHRyaWJ1dGVcbiAgICBkaWZmLktFWSA9ICdkYXRhLWN1c3RvbS1rZXknXG5cbiAgICAvLyBVcGRhdGUgaW5uZXIgaHRtbFxuICAgIGVsMS5pbm5lckhUTUwgPSAnPGEgaHJlZj1cImxpbmtcIj5oZWxsbzwvYT48YiBkYXRhLWN1c3RvbS1rZXk9XCJ0ZXN0MVwiPnRleHQ8L2I+PGkgZGF0YS1jdXN0b20ta2V5PVwidGVzdDJcIj50ZXh0MjwvaT4nXG4gICAgZWwyLmlubmVySFRNTCA9ICc8YSBocmVmPVwibGlua1wiPmhlbGxvPC9hPjxpIGRhdGEtY3VzdG9tLWtleT1cInRlc3QyXCI+dGV4dDI8L2k+PGIgZGF0YS1jdXN0b20ta2V5PVwidGVzdDFcIj50ZXh0PC9iPidcbiAgICB2YXIgb3JpZ2luYWxTZWNvbmRDaGlsZCA9IGVsMS5jaGlsZE5vZGVzWzFdXG4gICAgdmFyIG9yaWdpbmFsVGhpcmRDaGlsZCA9IGVsMS5jaGlsZE5vZGVzWzJdXG4gICAgZGlmZihlbDEsIGVsMilcblxuICAgIGFzc2VydC5lcXVhbChlbDEuaW5uZXJIVE1MLCAnPGEgaHJlZj1cImxpbmtcIj5oZWxsbzwvYT48aSBkYXRhLWN1c3RvbS1rZXk9XCJ0ZXN0MlwiPnRleHQyPC9pPjxiIGRhdGEtY3VzdG9tLWtleT1cInRlc3QxXCI+dGV4dDwvYj4nLCAnbW92ZSBjaGlsZHJlbicpXG4gICAgLy8gRW5zdXJlIHRoYXQgb3RoZXIgd2FzIG5vdCBkaXNjYXJkZWQuXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5jaGlsZE5vZGVzWzFdLCBvcmlnaW5hbFRoaXJkQ2hpbGQsICdwcmVzZXJ2ZWQgY2hpbGRyZW4nKVxuICAgIGFzc2VydC5lcXVhbChlbDEuY2hpbGROb2Rlc1syXSwgb3JpZ2luYWxTZWNvbmRDaGlsZCwgJ3ByZXNlcnZlZCBjaGlsZHJlbicpXG5cbiAgICAvLyBSZXNldCBjdXN0b20ga2V5IGF0dHJpYnV0ZVxuICAgIGRpZmYuS0VZID0gJ2RhdGEta2V5J1xuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBjaGlsZHJlbiAoZGF0YS1pZ25vcmUpJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJhXCIgZGF0YS1pZ25vcmU9XCJcIj5pbml0aWFsPC9kaXY+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImJcIiBkYXRhLWlnbm9yZT1cIlwiPmZpbmFsPC9kaXY+J1xuXG4gICAgLy8gQXR0ZW1wdCB0byBkaWZmXG4gICAgZGlmZihlbDEsIGVsMilcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmlubmVySFRNTCwgJzxkaXYgY2xhc3M9XCJhXCIgZGF0YS1pZ25vcmU9XCJcIj5pbml0aWFsPC9kaXY+JywgJ2RpZCBub3RoaW5nJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgd2hlbiBubyBsb25nZXIgaWdub3JlZCAoZGF0YS1pZ25vcmUpJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJhXCIgZGF0YS1pZ25vcmU9XCJcIj5pbml0aWFsPC9kaXY+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImJcIj5maW5hbDwvZGl2PidcblxuICAgIC8vIEF0dGVtcHQgdG8gZGlmZlxuICAgIGRpZmYoZWwxLCBlbDIpXG4gICAgYXNzZXJ0LmVxdWFsKGVsMS5pbm5lckhUTUwsICc8ZGl2IGNsYXNzPVwiYlwiPmZpbmFsPC9kaXY+JywgJ3VwZGF0ZWQgZG9tJylcbiAgfSlcblxuICBpdCgnc2hvdWxkIGRpZmYgY2hpbGRyZW4gKGRhdGEtaWdub3JlKSBjdXN0b20gYXR0cmlidXRlJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gU2V0IGN1c3RvbSBpZ25vcmUgYXR0cmlidXRlXG4gICAgZGlmZi5JR05PUkUgPSAnZGF0YS1jdXN0b20taWdub3JlJ1xuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJhXCIgZGF0YS1jdXN0b20taWdub3JlPVwiXCI+aW5pdGlhbDwvZGl2PidcbiAgICBlbDIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJiXCIgZGF0YS1jdXN0b20taWdub3JlPVwiXCI+ZmluYWw8L2Rpdj4nXG5cbiAgICAvLyBBdHRlbXB0IHRvIGRpZmZcbiAgICBkaWZmKGVsMSwgZWwyKVxuICAgIGFzc2VydC5lcXVhbChlbDEuaW5uZXJIVE1MLCAnPGRpdiBjbGFzcz1cImFcIiBkYXRhLWN1c3RvbS1pZ25vcmU9XCJcIj5pbml0aWFsPC9kaXY+JywgJ2RpZCBub3RoaW5nJylcblxuICAgIC8vIFJlc2V0IGN1c3RvbSBpZ25vcmUgYXR0cmlidXRlXG4gICAgZGlmZi5JR05PUkUgPSAnZGF0YS1pZ25vcmUnXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIGNoaWxkcmVuIChkYXRhLWNoZWNrc3VtKScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciBodG1sXG4gICAgZWwxLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiYVwiIGRhdGEtY2hlY2tzdW09XCJhYmNcIj5pbml0aWFsPC9kaXY+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImJcIiBkYXRhLWNoZWNrc3VtPVwiZWZnXCI+ZmluYWw8L2Rpdj4nXG5cbiAgICAvLyBBdHRlbXB0IHRvIGRpZmZcbiAgICBkaWZmKGVsMSwgZWwyKVxuICAgIGFzc2VydC5lcXVhbChlbDEuaW5uZXJIVE1MLCAnPGRpdiBjbGFzcz1cImJcIiBkYXRhLWNoZWNrc3VtPVwiZWZnXCI+ZmluYWw8L2Rpdj4nLCAnc2hvdWxkIGhhdmUgdXBkYXRlZCBlbGVtZW50JylcbiAgfSlcblxuICBpdCgnc2hvdWxkIG5vdCBkaWZmIGNoaWxkcmVuIChkYXRhLWNoZWNrc3VtKScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciBodG1sXG4gICAgZWwxLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiYVwiIGRhdGEtY2hlY2tzdW09XCJhYmNcIj5pbml0aWFsPC9kaXY+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImJcIiBkYXRhLWNoZWNrc3VtPVwiYWJjXCI+ZmluYWw8L2Rpdj4nXG5cbiAgICAvLyBBdHRlbXB0IHRvIGRpZmZcbiAgICBkaWZmKGVsMSwgZWwyKVxuICAgIGFzc2VydC5lcXVhbChlbDEuaW5uZXJIVE1MLCAnPGRpdiBjbGFzcz1cImFcIiBkYXRhLWNoZWNrc3VtPVwiYWJjXCI+aW5pdGlhbDwvZGl2PicsICdkaWQgbm90aGluZycpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBkaWZmIGNoaWxkcmVuIChkYXRhLWNoZWNrc3VtKSBjdXN0b20gYXR0cmlidXRlJywgZnVuY3Rpb24gKCkge1xuICAgIC8vIFNldCBjdXN0b20gY2hlY2tzdW0gYXR0cmlidXRlXG4gICAgZGlmZi5DSEVDS1NVTSA9ICdkYXRhLWN1c3RvbS1jaGVja3N1bSdcblxuICAgIHZhciBlbDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHZhciBlbDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgLy8gVXBkYXRlIGlubmVyIGh0bWxcbiAgICBlbDEuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJhXCIgZGF0YS1jdXN0b20tY2hlY2tzdW09XCJhYmNcIj5pbml0aWFsPC9kaXY+J1xuICAgIGVsMi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImJcIiBkYXRhLWN1c3RvbS1jaGVja3N1bT1cImVmZ1wiPmZpbmFsPC9kaXY+J1xuXG4gICAgLy8gQXR0ZW1wdCB0byBkaWZmXG4gICAgZGlmZihlbDEsIGVsMilcbiAgICBhc3NlcnQuZXF1YWwoZWwxLmlubmVySFRNTCwgJzxkaXYgY2xhc3M9XCJiXCIgZGF0YS1jdXN0b20tY2hlY2tzdW09XCJlZmdcIj5maW5hbDwvZGl2PicsICdzaG91bGQgaGF2ZSB1cGRhdGVkIGVsZW1lbnQnKVxuXG4gICAgLy8gUmVzZXQgY3VzdG9tIGNoZWNrc3VtIGF0dHJpYnV0ZVxuICAgIGRpZmYuQ0hFQ0tTVU0gPSAnZGF0YS1jaGVja3N1bSdcbiAgfSlcblxuICBpdCgnc2hvdWxkIGF1dG9tYXRpY2FsbHkgcGFyc2UgaHRtbCBmb3IgZGlmZicsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgZGlmZihlbCwgJzxkaXY+PGgxPmhlbGxvIHdvcmxkPC9oMT48L2Rpdj4nKVxuICAgIGFzc2VydC5lcXVhbChlbC5pbm5lckhUTUwsICc8aDE+aGVsbG8gd29ybGQ8L2gxPicsICdzaG91bGQgaGF2ZSB1cGRhdGVkIGVsZW1lbnQnKVxuICB9KVxuXG4gIGl0Lm9ubHkoJ3Nob3VsZCBkaWZmIGFuIGVudGlyZSBkb2N1bWVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCd0ZXN0JylcblxuICAgIGFzc2VydC5vayhkb2MuYm9keSwgJ3Nob3VsZCBoYXZlIGEgYm9keScpXG4gICAgZGlmZihkb2MsICc8IURPQ1RZUEUgaHRtbD48aHRtbD48aGVhZD48L2hlYWQ+PGJvZHk+aGVsbG8gd29ybGQ8L2JvZHk+PC9odG1sPicpXG4gICAgYXNzZXJ0LmVxdWFsKGRvYy5ib2R5LmlubmVySFRNTCwgJ2hlbGxvIHdvcmxkJywgJ3Nob3VsZCBoYXZlIHVwZGF0ZWQgZG9jdW1lbnQnKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGlmZiBhIGRvY3VtZW50IGZyYWdtZW50JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBmcmFnbWVudDEgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgICB2YXIgZnJhZ21lbnQyID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgICB2YXIgZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB2YXIgZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIC8vIFVwZGF0ZSBpbm5lciB0ZXh0XG4gICAgZWwxLmlubmVySFRNTCA9ICdoZWxsbyB3b3JsZCdcbiAgICBlbDIuaW5uZXJIVE1MID0gJ2hlbGxvIHdvcmxkIDInXG5cbiAgICBmcmFnbWVudDEuYXBwZW5kQ2hpbGQoZWwxKVxuICAgIGZyYWdtZW50Mi5hcHBlbmRDaGlsZChlbDIpXG5cbiAgICBkaWZmKGZyYWdtZW50MSwgZnJhZ21lbnQyKVxuICAgIGFzc2VydC5lcXVhbChlbDEuZmlyc3RDaGlsZC5ub2RlVmFsdWUsICdoZWxsbyB3b3JsZCAyJywgJ3VwZGF0ZSBub2RldmFsdWUnKVxuICB9KVxufSlcbiJdfQ==
