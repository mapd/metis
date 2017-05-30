/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var ROW = exports.ROW = "ROW";
var SCATTER = exports.SCATTER = "SCATTER";
var LINE = exports.LINE = "LINE";
var FACET_LINE = exports.FACET_LINE = "FACET_LINE";
var DATA_NAME = exports.DATA_NAME = "SOURCE";

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispatch = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.list = list;
exports.register = register;

var _crossfilter = __webpack_require__(16);

var _crossfilter2 = _interopRequireDefault(_crossfilter);

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chartRegistry = {};
var ids = [];

var redrawing = false;
var debounced = false;

var dispatch = exports.dispatch = d3.dispatch("xfilter", "filterAll", "renderAll", "redrawAll");

dispatch.on("filterAll", function () {
  _crossfilter2.default.filterAll();
  ids.forEach(function (id) {
    return chartRegistry[id].filterAll();
  });
  dispatch.call("redrawAll");
});

dispatch.on("renderAll", renderAll);

dispatch.on("redrawAll", function () {
  if (redrawing) {
    debounced = true;
    return;
  } else {
    redrawing = true;
    return redrawAll().then(function () {
      redrawing = false;
      if (debounced) {
        debounced = false;
        return redrawAll();
      }
    });
  }
});

dispatch.on("xfilter", function (_ref) {
  var type = _ref.type,
      id = _ref.id,
      field = _ref.field,
      filter = _ref.filter;

  if (type === "filter.exact") {
    _crossfilter2.default.filter(id, { type: type, field: field, equals: filter });
  } else if (type === "filter.range") {
    _crossfilter2.default.filter(id, { type: type, field: field, range: filter });
  }
  dispatch.call("redrawAll");
});

function renderAll() {
  return Promise.all(ids.map(function (id) {
    return chartRegistry[id].render();
  }));
}

function redrawAll() {
  return Promise.all(ids.map(function (id) {
    return chartRegistry[id].redraw();
  }));
}

function list(id) {
  return id ? chartRegistry : chartRegistry[id];
}

function register(id) {
  var _this = this;

  var _data = null;
  var _filters = [];
  var _filterReducer = null;

  var _dispatch = d3.dispatch("render", "redraw", "filter", "filterAll");

  _dispatch.on("filter", function (filterAction) {
    _filters = _filterReducer(_filters, filterAction);
    dispatch.call("xfilter", _this, _extends({}, filterAction, { filter: _filters }));
  });

  var chart = {
    on: function on(event, handler) {
      _dispatch.on(event, handler);
    },
    trigger: function trigger(event, context, value) {
      _dispatch.call(event, context, value);
    },
    data: function data(_data2) {
      return !arguments.length ? _data : _data = _data2;
    },
    render: function render() {
      return _data.values().then(function (data) {
        _dispatch.call("render", chart, data);
      });
    },
    redraw: function redraw() {
      return _data.values().then(function (data) {
        _dispatch.call("redraw", chart, data);
      });
    },
    filterReduce: function filterReduce(reducer) {
      return !arguments.length ? _filterReducer : _filterReducer = reducer;
    },
    filter: function filter(filterAction) {
      return !arguments.length ? _filters : _dispatch.call("filter", chart, filterAction);
    },
    filterAll: function filterAll() {
      _filters = [];
      _dispatch.call("filterAll", chart);
    }
  };

  ids.push(id);
  chartRegistry[id] = chart;

  return chart;
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

var _dataGraph = __webpack_require__(17);

var _connector = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = (0, _dataGraph.createDataGraph)({ query: _connector.query, tables: ["flights_donotmodify"] });

/***/ }),
/* 3 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(src) {
	if (typeof execScript !== "undefined")
		execScript(src);
	else
		eval.call(null, src);
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.query = query;
exports.connect = connect;
var connection = new MapdCon().protocol("https").host("metis.mapd.com").port("443").dbName("mapd").user("mapd").password("HyperInteractive");

connection.logging(true);

function query(stmt) {
  return new Promise(function (resolve, reject) {
    return connection.query(stmt, null, function (error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

function connect() {
  return new Promise(function (resolve, reject) {
    return connection.connect(function (error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3)(__webpack_require__(10))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3)(__webpack_require__(11))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _connector = __webpack_require__(4);

var _chartRegistry = __webpack_require__(1);

var _chartRow = __webpack_require__(14);

var _chartRow2 = _interopRequireDefault(_chartRow);

var _chartScatter = __webpack_require__(15);

var _chartScatter2 = _interopRequireDefault(_chartScatter);

var _chartLine = __webpack_require__(13);

var _chartLine2 = _interopRequireDefault(_chartLine);

var _chartFacet = __webpack_require__(12);

var _chartFacet2 = _interopRequireDefault(_chartFacet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _connector.connect)().then(function () {
  (0, _chartRow2.default)();
  (0, _chartScatter2.default)();
  (0, _chartLine2.default)();
  (0, _chartFacet2.default)();
  _chartRegistry.dispatch.call("renderAll");
}).then(function () {
  document.getElementById("filter-all").addEventListener("click", function () {
    _chartRegistry.dispatch.call("filterAll");
  });
});

/***/ }),
/* 9 */
/***/ (function(module, exports) {

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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 10 */
/***/ (function(module, exports) {


/***/ }),
/* 11 */
/***/ (function(module, exports) {


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _chartRegistry = __webpack_require__(1);

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

var _datagraph = __webpack_require__(2);

var _datagraph2 = _interopRequireDefault(_datagraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var facetLineDataNode = _datagraph2.default.data({
  source: "xfilter",
  name: "facet",
  transform: [{
    type: "formula.extract",
    unit: "month",
    field: "arr_timestamp",
    as: "key0"
  }, {
    type: "formula.extract",
    unit: "hour",
    field: "arr_timestamp",
    as: "key1"
  }, {
    type: "aggregate",
    fields: ["arrdelay"],
    ops: ["sum"],
    as: ["delay"],
    groupby: ["key0", "key1"]
  }, {
    type: "collect",
    sort: { field: ["key0", "key1"] }
  }, {
    type: "filter",
    expr: "arrdelay IS NOT NULL"
  }, {
    type: "resolvefilter",
    filter: { signal: "vega" },
    ignore: constants.FACET_LINE
  }]
});

var FACET_LINE_VEGA = {
  $schema: "https://vega.github.io/schema/vega/v3.0.json",
  width: 350,
  padding: 5,

  signals: [{ name: "rangeStep", value: 25 }, { name: "height", update: "rangeStep * 24" }],

  data: [{
    name: constants.DATA_NAME,
    values: []
  }],

  scales: [{
    name: "color",
    type: "sequential",
    range: { scheme: "viridis" },
    domain: { data: constants.DATA_NAME, field: "delay" },
    zero: false,
    nice: false
  }, {
    name: "row",
    type: "band",
    domain: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5],
    range: { step: { signal: "rangeStep" } }
  }, {
    name: "x",
    type: "linear",
    zero: false,
    round: true,
    nice: true,
    domain: { data: constants.DATA_NAME, field: "key0" },
    range: "width"
  }, {
    name: "y",
    type: "linear",
    zero: false,
    domain: { data: constants.DATA_NAME, field: "delay" },
    range: [{ signal: "rangeStep" }, 1]
  }],

  axes: [{
    orient: "bottom",
    scale: "x",
    domain: false,
    title: "Month",
    encode: {
      labels: {
        update: {
          text: { signal: "datum.value" }
        }
      }
    }
  }, {
    orient: "left",
    scale: "row",
    domain: false,
    title: "Hour",
    tickSize: 0,
    encode: {
      labels: {
        update: {
          text: { signal: "datum.value" }
        }
      }
    }
  }],

  legends: [
    // {"fill": "color", "type": "gradient", "title": "dep_delay"}
  ],

  marks: [{
    type: "group",
    from: {
      facet: {
        name: "key1",
        data: constants.DATA_NAME,
        groupby: "key1"
      }
    },
    encode: {
      enter: {
        x: { value: 0 },
        y: { scale: "row", field: "key1" },
        width: { signal: "width" },
        height: { signal: "rangeStep" }
      }
    },
    marks: [{
      type: "area",
      from: { data: "key1" },
      encode: {
        enter: {
          x: { scale: "x", field: "key0" },
          y: { scale: "y", field: "delay" },
          y2: { signal: "rangeStep" },
          fill: { scale: "color", field: "delay" }
        }
      }
    }]
  }, {
    type: "text",
    encode: {
      enter: {
        x: { value: 0 },
        y: { value: -4 },
        text: { value: "Arrival Times Annual Delay" },
        baseline: { value: "bottom" },
        fontSize: { value: 14 },
        fontWeight: { value: "bold" },
        fill: { value: "black" }
      }
    }
  }]
};

var view = null;

function render(data) {
  FACET_LINE_VEGA.data[0].values = data;

  var runtime = vega.parse(FACET_LINE_VEGA);
  view = new vega.View(runtime);

  view.initialize(document.querySelector("#facet-line")).logLevel(vega.Warn).renderer("canvas").run();
}

function redraw(data) {
  view.setState({ data: _defineProperty({}, constants.DATA_NAME, data) });
}

function create() {
  var chart = (0, _chartRegistry.register)(constants.FACET_LINE);
  chart.on("render", render);
  chart.on("redraw", redraw);
  chart.on("filterAll", function () {});
  chart.data(facetLineDataNode);
  chart.filterReduce(function () {});
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _chartRegistry = __webpack_require__(1);

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

var _datagraph = __webpack_require__(2);

var _datagraph2 = _interopRequireDefault(_datagraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var lineDataNode = _datagraph2.default.data({
  source: "xfilter",
  name: "line",
  transform: [{
    type: "formula.date_trunc",
    unit: "day",
    field: "dep_timestamp",
    as: "x"
  }, {
    type: "aggregate",
    fields: ["*"],
    ops: ["count"],
    as: ["y"],
    groupby: "x"
  }, {
    type: "collect.sort",
    sort: { field: ["x"] }
  }, {
    type: "filter.range",
    id: "test",
    field: "dep_timestamp",
    range: ["TIMESTAMP(0) '1987-10-01 00:03:00'", "TIMESTAMP(0) '2008-12-31 23:59:00'"]
  }, {
    type: "resolvefilter",
    filter: { signal: "vega" },
    ignore: constants.LINE
  }]
});

var LINE_VEGA_SPEC = {
  $schema: "https://vega.github.io/schema/vega/v3.0.json",
  width: 500,
  height: 200,
  padding: 15,
  title: "# Records by Departure Month",
  signals: [{
    name: "brush",
    value: [50, 150],
    on: [{
      events: "@overview:mousedown",
      update: "[x(), x()]"
    }, {
      events: "[@overview:mousedown, window:mouseup] > window:mousemove!",
      update: "[brush[0], clamp(x(), 0, width)]"
    }, {
      events: { signal: "delta" },
      update: "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
    }]
  }, {
    name: "anchor",
    value: null,
    on: [{ events: "@brush:mousedown", update: "slice(brush)" }]
  }, {
    name: "xdown",
    value: 0,
    on: [{ events: "@brush:mousedown", update: "x()" }]
  }, {
    name: "delta",
    value: 0,
    on: [{
      events: "[@brush:mousedown, window:mouseup] > window:mousemove!",
      update: "x() - xdown"
    }]
  }],

  data: [{
    name: constants.DATA_NAME,
    values: [],
    parse: { x: 'utc:"%Y"' }
  }],

  scales: [{
    name: "x",
    type: "utc",
    range: "width",
    domain: { data: constants.DATA_NAME, field: "x" }
  }, {
    name: "y",
    type: "linear",
    range: "height",
    nice: true,
    zero: false,
    domain: { data: constants.DATA_NAME, field: "y" }
  }],

  axes: [{
    orient: "bottom",
    scale: "x",
    format: "%m-%Y",
    title: "date_trunc(month, dep_timestamp)"
  }, { orient: "left", scale: "y", title: "# of Records" }],

  marks: [{
    type: "line",
    name: "overview",
    from: { data: constants.DATA_NAME },
    encode: {
      enter: {
        x: { scale: "x", field: "x" },
        y: { scale: "y", field: "y" },
        stroke: { value: "steelblue" },
        strokeWidth: { value: 2 }
      },
      update: {
        fillOpacity: { value: 1 }
      },
      hover: {
        fillOpacity: { value: 0.5 }
      }
    }
  }, {
    type: "rect",
    name: "brush",
    encode: {
      enter: {
        y: { value: 0 },
        height: { value: 200 },
        fill: { value: "steelblue" },
        fillOpacity: { value: 0.2 }
      },
      update: {
        x: { signal: "brush[0]" },
        x2: { signal: "brush[1]" }
      }
    }
  }, {
    type: "rect",
    interactive: false,
    encode: {
      enter: {
        y: { value: 0 },
        height: { value: 200 },
        width: { value: 1 },
        fill: { value: "firebrick" }
      },
      update: {
        x: { signal: "brush[0]" }
      }
    }
  }, {
    type: "rect",
    interactive: false,
    encode: {
      enter: {
        y: { value: 0 },
        height: { value: 200 },
        width: { value: 1 },
        fill: { value: "firebrick" }
      },
      update: {
        x: { signal: "brush[1]" }
      }
    }
  }, {
    name: "bubble",
    type: "symbol",
    from: { data: constants.DATA_NAME },
    encode: {
      update: {
        x: { scale: "x", field: "x" },
        y: { scale: "y", field: "y" },
        size: { value: 20 },
        shape: { value: "circle" },
        strokeWidth: { value: 2 },
        fill: { value: "steelblue" }
      }
    }
  }]
};

var view = null;

function render(data) {
  var _this = this;

  LINE_VEGA_SPEC.data[0].values = data;

  var extent = [data[0].x, data[data.length - 1].x];
  var scale = d3.scaleTime().domain(extent).range([0, 500]);

  var runtime = vega.parse(LINE_VEGA_SPEC);
  view = new vega.View(runtime);

  view.initialize(document.querySelector("#chart3")).logLevel(vega.Warn).renderer("svg").run();

  view.addSignalListener("brush", function (signal, range) {
    _this.filter({
      type: "filter.range",
      id: constants.LINE,
      field: "dep_timestamp",
      filter: [scale.invert(range[0]), scale.invert(range[1])]
    });
  });
}

function redraw(data) {
  view.setState({ data: _defineProperty({}, constants.DATA_NAME, data) });
}

function filterAll() {
  // view.setState({ data: { selected: [] } })
}

function reduceFilters(filters, _ref) {
  var filter = _ref.filter;

  var formatTime = d3.timeFormat("%Y-%m-%d %-I:%M:%S");
  return ["TIMESTAMP(0) '" + formatTime(filter[0]) + "'", "TIMESTAMP(0) '" + formatTime(filter[1]) + "'"];
}

function create() {
  var chart = (0, _chartRegistry.register)(constants.LINE);
  chart.on("render", render);
  chart.on("redraw", redraw);
  chart.on("filterAll", filterAll);
  chart.data(lineDataNode);
  chart.filterReduce(reduceFilters);
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _chartRegistry = __webpack_require__(1);

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

var _datagraph = __webpack_require__(2);

var _datagraph2 = _interopRequireDefault(_datagraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var rowDataNode = _datagraph2.default.data({
  source: "xfilter",
  name: "row",
  transform: [{
    type: "aggregate",
    fields: ["dest_state"],
    groupby: ["dest_state"]
  }, {
    type: "aggregate",
    fields: ["*"],
    ops: ["count"],
    as: ["records"]
  }, {
    type: "collect.sort",
    sort: {
      field: ["records"],
      order: ["descending"]
    }
  }, {
    type: "collect.limit",
    limit: {
      row: 12
    }
  }, {
    type: "resolvefilter",
    filter: { signal: "vega" },
    ignore: constants.ROW
  }]
});

var ROW_VEGA_SPEC = {
  $schema: "https://vega.github.io/schema/vega/v3.0.json",
  width: 250,
  height: 250,
  padding: 5,
  title: "# Records by Destination State",
  data: [{ name: constants.DATA_NAME, values: [] }, {
    name: "selected",
    on: [{ trigger: "clicked", toggle: "clicked" }]
  }],

  signals: [{
    name: "filter",
    value: null,
    on: [{
      events: "@bars:click",
      update: "{value: datum.dest_state, selected: indata('selected', 'value', datum.dest_state)}",
      force: true
    }]
  }, {
    name: "clicked",
    value: null,
    on: [{
      events: "@bars:click",
      update: "{value: datum.dest_state}",
      force: true
    }]
  }],

  scales: [{
    name: "xscale",
    type: "band",
    domain: { data: constants.DATA_NAME, field: "dest_state" },
    range: "width"
  }, {
    name: "yscale",
    domain: { data: constants.DATA_NAME, field: "records" },
    nice: true,
    range: "height"
  }],

  axes: [{ orient: "bottom", scale: "xscale", title: "Destination State" }, { orient: "left", scale: "yscale", title: "# of Records" }],

  marks: [{
    type: "rect",
    name: "bars",
    interactive: true,
    from: { data: constants.DATA_NAME },
    encode: {
      enter: {
        x: { scale: "xscale", field: "dest_state", offset: 1 },
        width: { scale: "xscale", band: 1, offset: -1 },
        y: { scale: "yscale", field: "records" },
        y2: { scale: "yscale", value: 0 }
      },
      update: {
        fill: [{
          test: "!length(data('selected')) || indata('selected', 'value', datum.dest_state)",
          value: "steelblue"
        }, { value: "#D3D3D3" }]
      },
      hover: {
        fill: { value: "red" }
      }
    }
  }, {
    type: "text",
    encode: {
      enter: {
        align: { value: "center" },
        baseline: { value: "bottom" },
        fill: { value: "#333" }
      }
    }
  }]
};

var view = null;

function render(data) {
  var _this = this;

  ROW_VEGA_SPEC.data[0].values = data;
  var runtime = vega.parse(ROW_VEGA_SPEC);
  view = new vega.View(runtime);

  view.initialize(document.querySelector("#chart")).logLevel(vega.Warn).renderer("svg").run();

  view.addSignalListener("filter", function (signal, filter) {
    _this.filter({
      type: "filter.exact",
      id: constants.ROW,
      field: "dest_state",
      filter: filter
    });
  });
}

function redraw(data) {
  view.setState({ data: _defineProperty({}, constants.DATA_NAME, data) });
}

function filterAll() {
  view.setState({ data: { selected: [] } });
}

function reduceFilters(filters, filterAction) {
  if (filterAction.filter.selected) {
    var index = filters.indexOf(filterAction.filter.value);
    var nextFilters = filters.slice();
    nextFilters.splice(index, 1);
    return nextFilters;
  } else {
    return filters.concat(filterAction.filter.value);
  }
}

function create() {
  var chart = (0, _chartRegistry.register)(constants.ROW);
  chart.on("render", render);
  chart.on("redraw", redraw);
  chart.on("filterAll", filterAll);
  chart.data(rowDataNode);
  chart.filterReduce(reduceFilters);
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _chartRegistry = __webpack_require__(1);

var _constants = __webpack_require__(0);

var constants = _interopRequireWildcard(_constants);

var _datagraph = __webpack_require__(2);

var _datagraph2 = _interopRequireDefault(_datagraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var scatterDataNode = _datagraph2.default.data({
  source: "xfilter",
  name: "scatter",
  transform: [{
    type: "aggregate",
    fields: ["carrier_name"],
    as: ["key0"],
    groupby: "key0"
  }, {
    type: "aggregate",
    fields: ["depdelay", "arrdelay", "*"],
    as: ["x", "y", "size"],
    ops: ["average", "average", "count"]
  }, {
    type: "filter",
    id: "test",
    expr: "depdelay IS NOT NULL"
  }, {
    type: "filter",
    id: "test",
    expr: "arrdelay IS NOT NULL"
  }, {
    type: "collect.sort",
    sort: {
      field: ["size"],
      order: ["descending"]
    }
  }, {
    type: "collect.limit",
    limit: {
      row: 12
    }
  }, {
    type: "resolvefilter",
    filter: { signal: "vega" },
    ignore: constants.SCATTER
  }]
});

var SCATTER_VEGA_SPEC = {
  $schema: "https://vega.github.io/schema/vega/v3.0.json",
  width: 250,
  height: 250,
  padding: 5,
  autosize: "pad",
  title: "Average Arrival and Departure Delay by Carrier Name",
  data: [{ name: constants.DATA_NAME, values: [] }, {
    name: "selected",
    on: [{ trigger: "clicked", toggle: "clicked" }]
  }],

  signals: [{
    name: "filter",
    value: null,
    on: [{
      events: "@bubble:click",
      update: "{value: datum.key0, selected: indata('selected', 'value', datum.key0)}",
      force: true
    }]
  }, {
    name: "clicked",
    value: null,
    on: [{
      events: "@bubble:click",
      update: "{value: datum.key0}",
      force: true
    }]
  }],
  scales: [{
    name: "x",
    type: "linear",
    round: true,
    nice: true,
    zero: true,
    domain: { data: constants.DATA_NAME, field: "x" },
    range: [0, 250]
  }, {
    name: "y",
    type: "linear",
    round: true,
    nice: true,
    zero: true,
    domain: { data: constants.DATA_NAME, field: "y" },
    range: [250, 0]
  }, {
    name: "size",
    type: "linear",
    round: true,
    nice: false,
    zero: true,
    domain: { data: constants.DATA_NAME, field: "size" },
    range: [4, 361]
  }, {
    name: "color",
    type: "ordinal",
    range: { scheme: "category10" },
    domain: { data: constants.DATA_NAME, field: "key0" }
  }],

  axes: [{
    scale: "x",
    grid: true,
    domain: false,
    orient: "bottom",
    tickCount: 5,
    title: "AVG(depdelay)"
  }, {
    scale: "y",
    grid: true,
    domain: false,
    orient: "left",
    titlePadding: 5,
    title: "AVG(arrdelay)"
  }],

  legends: [
    // {
    //   size: "size",
    //   title: "size",
    //   format: "s",
    //   encode: {
    //     symbols: {
    //       update: {
    //         strokeWidth: { value: 2 },
    //         opacity: { value: 0.5 },
    //         stroke: { value: "#4682b4" },
    //         shape: { value: "circle" }
    //       }
    //     }
    //   }
    // }
  ],

  marks: [{
    name: "bubble",
    type: "symbol",
    from: { data: constants.DATA_NAME },
    encode: {
      update: {
        x: { scale: "x", field: "x" },
        y: { scale: "y", field: "y" },
        size: { scale: "size", field: "size" },
        shape: { value: "circle" },
        strokeWidth: { value: 2 },
        fill: [{
          test: "!length(data('selected')) || indata('selected', 'value', datum.key0)",
          scale: "color",
          field: "key0"
        }, { value: "#D3D3D3" }]
      }
    }
  }]
};

// function handleFilterSignal(signal, filter) {
//   dispatch.call("filter", this, {
//     type: "exact",
//     id: constants.SCATTER,
//     field: "carrier_name",
//     filter
//   });
// }
//
// export function render(data) {
//   SCATTER_VEGA_SPEC.data[0].values = data;
//   const runtime = vega.parse(SCATTER_VEGA_SPEC);
//   const view = new vega.View(runtime);
//   dispatch.call("render", view, { id: constants.SCATTER, node: "#chart2" });
//   view.addSignalListener("filter", handleFilterSignal);
// }

var view = null;

function render(data) {
  var _this = this;

  SCATTER_VEGA_SPEC.data[0].values = data;
  var runtime = vega.parse(SCATTER_VEGA_SPEC);
  view = new vega.View(runtime);

  view.initialize(document.querySelector("#chart2")).logLevel(vega.Warn).renderer("svg").run();

  view.addSignalListener("filter", function (signal, filter) {
    _this.filter({
      type: "filter.exact",
      id: constants.SCATTER,
      field: "carrier_name",
      filter: filter
    });
  });
}

function redraw(data) {
  view.setState({ data: _defineProperty({}, constants.DATA_NAME, data) });
}

function filterAll() {
  view.setState({ data: { selected: [] } });
}

function reduceFilters(filters, filterAction) {
  if (filterAction.filter.selected) {
    var index = filters.indexOf(filterAction.filter.value);
    var nextFilters = filters.slice();
    nextFilters.splice(index, 1);
    return nextFilters;
  } else {
    return filters.concat(filterAction.filter.value);
  }
}

function create() {
  var chart = (0, _chartRegistry.register)(constants.SCATTER);
  chart.on("render", render);
  chart.on("redraw", redraw);
  chart.on("filterAll", filterAll);
  chart.data(scatterDataNode);
  chart.filterReduce(reduceFilters);
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.filter = filter;

var _datagraph = __webpack_require__(2);

var _datagraph2 = _interopRequireDefault(_datagraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xfilterDataNode = _datagraph2.default.data({
  source: "flights_donotmodify",
  name: "xfilter",
  transform: [{
    type: "crossfilter",
    signal: "vega",
    filter: []
  }]
});

function filter(id, filter) {
  var _xfilterDataNode$getS = xfilterDataNode.getState(),
      transform = _xfilterDataNode$getS.transform;

  var xfilters = transform[0].filter;
  var index = xfilters.findIndex(function (f) {
    return f.id === id;
  });
  if (index !== -1) {
    xfilters[index] = _extends({
      id: id
    }, filter);
  } else {
    xfilters.push(_extends({
      id: id
    }, filter));
  }
}

function filterAll() {
  var _xfilterDataNode$getS2 = xfilterDataNode.getState(),
      transform = _xfilterDataNode$getS2.transform;

  transform[0].filter = [];
}

exports.default = {
  filter: filter,
  filterAll: filterAll
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDataGraph = createDataGraph;

var _dataNode = __webpack_require__(18);

var _dataNode2 = _interopRequireDefault(_dataNode);

var _invariant = __webpack_require__(5);

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a SQL data graph instance.
* @memberof API
 */
function createDataGraph(connector) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  (0, _invariant2.default)(typeof connector.query === "function", "invalid connector");

  var context = {
    state: initialState,
    connector: connector
  };

  var _nodes = [];

  /**
   * An instance of a SQL data graph
   * @namespace Graph
   */
  return {
    /**
     * Returns all data node instances of the graph.
     * @memberof Graph
     * @inner
     */
    nodes: function nodes() {
      return _nodes;
    },

    /**
     * Returns the state of the graph.
     * @memberof Graph
     * @inner
     */
    getState: function getState() {
      return context.state;
    },

    /**
     * Creates a data node instance.
     * @memberof Graph
     * @inner
     */
    data: function data(state) {
      var dataNode = (0, _dataNode2.default)(context, state);
      context.state[state.name] = dataNode.getState();
      _nodes.push(dataNode);
      return dataNode;
    }
  };
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createDataNode;

var _nodePathUtils = __webpack_require__(19);

var _invariant = __webpack_require__(5);

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDataNode(context, initialState) {
  (0, _invariant2.default)(typeof initialState.name === "string", "must have name and source");

  (0, _invariant2.default)(initialState.source, "must have name and source");

  var state = _extends({}, initialState, {
    transform: initialState.transform || []
  });

  /**
   * A node in the graph that represents a set of data transformations.
   * @namespace Data
   */
  return {
    /**
     * Returns the state of the data node.
     * @memberof Data
     * @inner
     */
    getState: function getState() {
      return state;
    },

    /**
     * Sets the transform state of the data node.
     * @memberof Data
     * @inner
     */
    transform: function transform(_transform) {
      if (typeof _transform === "function") {
        state.transform = _transform(state.transform);
      } else if (Array.isArray(_transform)) {
        state.transform = state.transform.concat(_transform);
      } else if ((typeof _transform === "undefined" ? "undefined" : _typeof(_transform)) === "object") {
        state.transform.push(_transform);
      } else {
        (0, _invariant2.default)(true, "invalid transform");
      }
      return this;
    },

    /**
     * Returns the SQL string representation of the set of data transformations the node embodies.
     * @memberof Data
     * @inner
     */
    toSQL: function toSQL() {
      return (0, _nodePathUtils.nodePathToSQL)(context.state, state.name);
    },

    /**
     * Executes data node's SQL query representation and returns queried data as a promise.
     * @memberof Data
     * @inner
     */
    values: function values() {
      return context.connector.query((0, _nodePathUtils.nodePathToSQL)(context.state, state.name));
    }
  };
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walk = walk;
exports.reduceNodes = reduceNodes;
exports.resolveFilters = resolveFilters;
exports.nodePathToSQL = nodePathToSQL;

var _writeSql = __webpack_require__(27);

var _writeSql2 = _interopRequireDefault(_writeSql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var identity = function identity(a) {
  return a;
};


function createNodeReducer(state) {
  return function reduceNode(leftNode, rightNode) {
    return {
      name: "",
      source: state.hasOwnProperty(rightNode.source) ? leftNode.source : rightNode.source,
      transform: leftNode.transform.concat(rightNode.transform)
    };
  };
}

function walk(state, name, iterator, xform, accum) {
  var node = state[name];
  var source = node.source;

  accum = xform(accum, iterator(node));
  return state.hasOwnProperty(source) ? walk(state, source, iterator, xform, accum) : accum;
}

function reduceNodes(state, name) {
  return walk(state, name, identity, createNodeReducer(state), {
    name: "",
    source: "",
    transform: []
  });
}

var resolvedFilter = function resolvedFilter(transforms, signal) {
  return transforms.filter(function (transform) {
    return transform.type === "resolvefilter" && transform.filter.signal === signal;
  })[0];
};

function resolveFilters(state) {
  function reduceXFilters(transforms, transform) {
    if (transform.type === "crossfilter") {
      var resolved = resolvedFilter(state.transform, transform.signal);
      if (resolved.type === "resolvefilter") {
        transform.filter.forEach(function (filter) {
          if (Array.isArray(resolved.ignore) && resolved.ignore.indexOf(filter.id) === -1) {
            transforms.push(filter);
          } else if (typeof resolved.ignore === "string" && resolved.ignore !== filter.id) {
            transforms.push(filter);
          }
        });
      }
      return transforms;
    } else {
      return transforms.concat(transform);
    }
  }

  state.transform = state.transform.reduce(reduceXFilters, []).filter(function (transform) {
    return transform.type !== "resolvefilter";
  });

  return state;
}

function nodePathToSQL(state, source) {
  return (0, _writeSql2.default)(resolveFilters(reduceNodes(state, source)));
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAggregate;
var AGGREGATES = {
  average: "AVG",
  count: "COUNT",
  min: "MIN",
  max: "MAX",
  sum: "SUM"
};

function parseAggregate(sql, transform) {
  transform.fields.forEach(function (field, index) {
    var as = Array.isArray(transform.as) ? transform.as[index] : null;
    if (Array.isArray(transform.ops)) {
      sql.select.push(aggregateField(transform.ops[index], field, as));
    } else {
      sql.select.push(aggregateField(null, field, as));
    }
  });

  if (typeof transform.groupby === "string") {
    sql.groupby.push(transform.groupby);
  } else if (Array.isArray(transform.groupby)) {
    sql.groupby = sql.groupby.concat(transform.groupby);
  }

  return sql;
}

function aggregateField(op, field, as) {
  var str = "";
  if (op === null) {
    str += field;
  } else if (AGGREGATES[op]) {
    str += AGGREGATES[op] + "(" + field + ")";
  }
  return str + ("" + (as ? " as " + as : ""));
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseBin;
function parseBin(sql, _ref) {
  var field = _ref.field,
      as = _ref.as,
      extent = _ref.extent,
      maxbins = _ref.maxbins;

  sql.select.push("cast((cast(" + field + " as float) - " + extent[0] + ") * " + maxbins / (extent[1] - extent[0]) + " as int) as " + as);
  sql.where.push("((" + field + " >= " + extent[0] + " AND " + field + " <= " + extent[1] + ") OR (" + field + " IS NULL))");
  sql.groupby.push(as);
  sql.having.push("(" + as + " >= 0 AND " + as + " < " + maxbins + " OR " + as + " IS NULL)");
  return sql;
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseCollect;
var ORDERINGS = {
  ascending: "ASC",
  descending: "DESC"
};

function parseSort(sql, transform) {
  transform.sort.field.forEach(function (field, index) {
    sql.orderby.push(field + (Array.isArray(transform.sort.order) ? " " + ORDERINGS[transform.sort.order[index]] : ""));
  });
  return sql;
}

function parseCollect(sql, transform) {
  switch (transform.type) {
    case "collect.sort":
      return parseSort(sql, transform);
    case "collect.limit":
      sql.limit += transform.limit.row;
      sql.offset += transform.limit.offset || sql.offset;
      return sql;
    default:
      return sql;
  }
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFilter;
function parseFilterExact(sql, transform) {
  if (typeof transform.equals === "string") {
    sql.where.push("(" + transform.field + " = " + "'" + transform.equals + "'" + ")");
  } else if (Array.isArray(transform.equals) && transform.equals.length) {
    var stmt = transform.equals.map(function (equal) {
      return transform.field + " = " + "'" + equal + "'";
    }).join(" OR ");

    sql.where.push("(" + stmt + ")");
  }
  return sql;
}

function parseFilterRange(sql, transform) {
  sql.where.push("(" + transform.field + " >= " + transform.range[0] + " AND " + transform.field + " <= " + transform.range[1] + ")");

  return sql;
}

function parseFilter(sql, transform) {
  switch (transform.type) {
    case "filter":
      sql.where.push("(" + transform.expr + ")");
      return sql;
    case "filter.range":
      return parseFilterRange(sql, transform);
    case "filter.exact":
      return parseFilterExact(sql, transform);
    default:
      return sql;
  }
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = formula;
function formula(sql, transform) {
  if (transform.type === "formula") {
    sql.select.push(transform.expr + " as " + transform.as);
  } else if (transform.type === "formula.date_trunc") {
    sql.select.push("date_trunc(" + transform.unit + ", " + transform.field + ") as " + transform.as);
  } else if (transform.type === "formula.extract") {
    sql.select.push("extract(" + transform.unit + " from " + transform.field + ") as " + transform.as);
  }

  return sql;
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sample;
function sample(sql, transform) {
  return sql;
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _parseAggregate = __webpack_require__(20);

var _parseAggregate2 = _interopRequireDefault(_parseAggregate);

var _parseBin = __webpack_require__(21);

var _parseBin2 = _interopRequireDefault(_parseBin);

var _parseCollect = __webpack_require__(22);

var _parseCollect2 = _interopRequireDefault(_parseCollect);

var _parseFilter = __webpack_require__(23);

var _parseFilter2 = _interopRequireDefault(_parseFilter);

var _parseFormula = __webpack_require__(24);

var _parseFormula2 = _interopRequireDefault(_parseFormula);

var _parseSample = __webpack_require__(25);

var _parseSample2 = _interopRequireDefault(_parseSample);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(_ref) {
  var source = _ref.source,
      transform = _ref.transform;

  var initialSQL = {
    select: [],
    from: source,
    where: [],
    groupby: [],
    having: [],
    orderby: [],
    limit: "",
    offset: ""
  };

  return transform.reduce(function (sql, t) {
    switch (t.type) {
      case "aggregate":
        return (0, _parseAggregate2.default)(sql, t);
      case "bin":
        return (0, _parseBin2.default)(sql, t);
      case "collect.sort":
      case "collect.limit":
        return (0, _parseCollect2.default)(sql, t);
      case "filter":
      case "filter.exact":
      case "filter.range":
        return (0, _parseFilter2.default)(sql, t);
      case "formula":
      case "formula.date_trunc":
      case "formula.extract":
        return (0, _parseFormula2.default)(sql, t);
      case "sample":
        return (0, _parseSample2.default)(sql, t);
      default:
        return sql;
    }
  }, initialSQL);
}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = writeSQL;

var _parseTransform = __webpack_require__(26);

var _parseTransform2 = _interopRequireDefault(_parseTransform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a SQL query string based on the DataState passed in.
* @memberof API
 */
function writeSQL(state) {
  return write((0, _parseTransform2.default)(state));
}


function write(sql) {
  return writeSelect(sql.select) + writeFrom(sql.from) + writeWhere(sql.where) + writeGroupby(sql.groupby) + writeHaving(sql.having) + writeOrderBy(sql.orderby) + writeLimit(sql.limit) + writeOffset(sql.offset);
}

function writeSelect(select) {
  return select.length ? "SELECT " + select.join(", ") : "SELECT *";
}

function writeFrom(from) {
  return " FROM " + from;
}

function writeWhere(where) {
  return where.length ? " WHERE " + where.join(" AND ") : "";
}

function writeGroupby(groupby) {
  return groupby.length ? " GROUP BY " + groupby.join(", ") : "";
}

function writeHaving(having) {
  return having.length ? " HAVING " + having.join(" AND ") : "";
}

function writeOrderBy(orderby) {
  return orderby.length ? " ORDER BY " + orderby.join(", ") : "";
}

function writeLimit(limit) {
  return limit.length ? " LIMIT " + limit : "";
}

function writeOffset(offset) {
  return offset.length ? " OFFSET " + offset : "";
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6);
__webpack_require__(7);
module.exports = __webpack_require__(8);


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map