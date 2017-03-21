# Files
NM = node_modules
BIN = $(NM)/.bin
SRC_IN = src/index.js
SRC_OUT = dist/set-dom.js
SRC_OUT_MAP = dist/set-dom.map.js
TESTS_IN = test/*.test.js
TESTS_OUT = test/run.js

# Tools
standard = $(BIN)/standard
snazzy = $(BIN)/snazzy
coveralls = $(BIN)/coveralls
istanbul = $(BIN)/istanbul
mocha = $(BIN)/_mocha
jsdom = $(NM)/jsdom-global
browserify = $(BIN)/browserify
exorcist = $(BIN)/exorcist
uglifyjs = $(BIN)/uglifyjs

# Run standard linter.
lint:
	$(standard) --fix --verbose | $(snazzy)

# Save code coverage to coveralls
coveralls:
	cat coverage/lcov.info | $(coveralls)

# Run standard linter, mocha tests and istanbul coverage.
test:
	@NODE_ENV=test \
		$(istanbul) cover \
		$(mocha) --require $(jsdom)/register --report html --report lcov -- -u exports $(TESTS_IN)

# Run standard linter, mocha tests and istanbul coverage but bail early and only save lcov coverage report.
test-ci:
	@NODE_ENV=test \
		${istanbul} cover \
		$(mocha) --require $(jsdom)/register --report lcovonly -- -u exports $(TESTS_IN) --bail

# Build dist file for downloads.
build:
	@NODE_ENV=test \
		$(browserify) -p bundle-collapser/plugin --standalone setDOM --debug $(SRC_IN) | \
		$(exorcist) $(SRC_OUT_MAP) > $(SRC_OUT); \
		$(uglifyjs) $(SRC_OUT) --output $(SRC_OUT) \
			--in-source-map $(SRC_OUT_MAP) \
			--screw_ie8 \
			--compress \
				warnings=false,unused,sequences,properties,dead_code,drop_debugger,conditionals,comparisons,evaluate,booleans,loops,hoist_funs,if_return,join_vars,cascade,drop_console,keep_fargs=false\
			--mangle

# Build tests for browser.
build-test:
	@NODE_ENV=test \
		$(browserify) -p bundle-collapser/plugin --standalone setDOM --debug $(TESTS_IN) > $(TESTS_OUT)

.PHONY: test
