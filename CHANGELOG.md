# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
