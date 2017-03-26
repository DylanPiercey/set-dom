# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 7.1.0 - 2017-03-26
### Changed
- Improve html string parsing performance in older browsers.
- Remove trying to parse html string as XML (caused issues with special elements like tables).

## 7.0.3 - 2017-03-20
### Changed
- Fixed license date and name.
- Add lcov report when testing locally.
- Optimize one line.

## 7.0.2 - 2017-03-19
### Changed
- Refactored to use better veriable names.

## 7.0.1 - 2017-03-15
### Changed
- Fixed regression in diffing algorithm with empty text nodes causing some nodes to be skipped.

## 7.0.0 - 2017-03-13
### Changed
- Switched to new diffing algorithm which is up to 50% faster and less memory intensive in some browsers.

## 6.0.1 - 2017-02-13
### Changed
- Fixed typo in README.
- Added more tests for data-checksum.
- Made DOMParser optional (IE < 8).

## 6.0.0 - 2016-12-19
### Changed
- Added `data-checksum` property. This aids in performance by allowing the user to provide a checksum which will be checked before diffing nodes. Allows users to skip the diffing algorithm by comparing state via checksum.

## 5.0.3, 5.0.4 - 2016-11-27
### Changed
- Updated devDependencies.

## 5.0.0, 5.0.1, 5.0.2 - 2016-10-19
### Changed
- Now uses DOMParser (and shim for older browsers) for faster html string parsing.
- Minor compression optimization.
- Change travis build to only be node 6 (Cross browser issues left to saucelabs).

## 4.0.3 - 2016-10-19
### Changed
- Fix issue when diffing namespaced attributes.

## 4.0.2 - 2016-10-10
### Changed
- Fix issue where `data-key=SOME_INTEGER` or `id=SOME_INTEGER` could conflict with the algorithm.

## 4.0.1 - 2016-10-06
### Changed
- Fix issue with mounting while switching node types.
- Fix issue with initial mounting of nodes.

## 4.0.0 - 2016-10-06
### Changed
- Elements with `data-key` or `id` attributes will now emit custom `mount` and `dismount` events when added and removed from the DOM.

## 3.1.0 - 2016-09-24
### Changed
- Ignored elements will now be diffed when the next element is not ignored.

## 3.0.0 - 2016-09-20
### Changed
- Add minor diff optimization for replacing nodes.
- Switch tests to mocha.
- 100% test coverage.
- Added source map to dist.

### Added
- build with travis
- code coverage with coveralls
- switch to use makefile

## 2.0.5 - 2016-09-18
### Changed
- Updated dev devDependencies and add git tags.

## 2.0.0 - 2016-09-16
### Changed
- Added `data-ignore` attribute which will disable diffing for an element.
- Added ability to override `data-key` and `data-ignore` attributes.
- Added changelog.
