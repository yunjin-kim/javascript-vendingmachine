/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "./node_modules/axios/lib/defaults/transitional.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "./node_modules/axios/lib/defaults/transitional.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/chargePage.css":
/*!**********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/chargePage.css ***!
  \**********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".charge-control-input {\n  width: 300px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n#charge-control-table {\n  width: 236px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n  margin: auto;\n}", "",{"version":3,"sources":["webpack://./src/css/chargePage.css"],"names":[],"mappings":"AAAA;EACE,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,yBAAyB;EACzB,iBAAiB;EACjB,eAAe;EACf,eAAe;AACjB;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,6BAA6B;EAC7B,gCAAgC;EAChC,yBAAyB;EACzB,YAAY;AACd","sourcesContent":[".charge-control-input {\n  width: 300px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n#charge-control-table {\n  width: 236px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n  margin: auto;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/index.css":
/*!*****************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/index.css ***!
  \*****************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_productPage_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!./productPage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/productPage.css");
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_chargePage_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!./chargePage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/chargePage.css");
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_purchasePage_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!./purchasePage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/purchasePage.css");
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_memberPage_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! -!../../node_modules/css-loader/dist/cjs.js!./memberPage.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/memberPage.css");
// Imports






var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_productPage_css__WEBPACK_IMPORTED_MODULE_2__["default"]);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_chargePage_css__WEBPACK_IMPORTED_MODULE_3__["default"]);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_purchasePage_css__WEBPACK_IMPORTED_MODULE_4__["default"]);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_memberPage_css__WEBPACK_IMPORTED_MODULE_5__["default"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#app {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n\ninput {\n  padding: 0;\n}\n\nbutton {\n  border: none;\n}\n\n.header {\n  width: 470px;\n}\n\n.header-text {\n  text-align: center;\n}\n\n.member-wrap {\n  float: right;\n  margin-top: -50px;\n}\n\n.member-login-button {\n  width: 60px;\n  height: 30px;\n  cursor: pointer;\n  font-weight: 800;\n}\n\n.member-login-button:hover {\n  background-color: #ebebeb;\n}\n\n.nav {\n  display: flex;\n  justify-content: center;\n  margin-bottom: 48px;\n}\n\n.button {\n  cursor: pointer;\n  border-radius: 4px;\n  border: none;\n  font-style: normal;\n  font-weight: bold;\n  font-size: 14px;\n  letter-spacing: 1.25px;\n}\n\n.nav__button {\n  width: 120px;\n  height: 36px;\n  background: #f5f5f5;\n  margin: 0 4px;\n}\n\n.nav__button:hover {\n  background: #ebebeb;\n}\n\n.button-click {\n  background: #00bcd41f;\n}\n\n#product-add-button,\n#charge-add-button,\n#insert-money-button {\n  width: 56px;\n  height: 38px;\n  cursor: pointer;\n  background: #00bcd4;\n  border-radius: 5px;\n  border: none;\n  margin-left: 16px;\n  color: white;\n  font-size: 16px;\n}\n\n#product-table-title,\n#charge-table-title,\n#purchase-product-table-title,\n#return-charge-table-title {\n  text-align: center;\n  margin-top: 40px;\n}\n\n#product-control-table td,\n#product-control-table th,\n#charge-control-table td,\n#charge-control-table th,\n#purchase-possible-product-table td,\n#purchase-possible-product-table th,\n#return-charge-table td,\n#return-charge-table th {\n  width: 118px;\n  height: 40px;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n}\n\n.product-edit-button,\n.product-remove-button,\n.product-confirm-button {\n  cursor: pointer;\n  background: #f5f5f5;\n  border-radius: 5px;\n  height: 32px;\n}\n\n.product-edit-button,\n.product-remove-button {\n  width: 50px;\n}\n\n.product-edit-button:hover,\n.product-remove-button:hover,\n.product-confirm-button:hover {\n  background: #ebebeb;\n}\n\n#snackbar-wrap {\n  width: 302px;\n  overflow: hidden;\n  position: fixed;\n  bottom: 10px;\n  left: 20px;\n}\n\n.snackbar {\n  width: 300px;\n  height: 60px;\n  background-color: #5c5c5c;\n}\n\n.snackbar-text {\n  color: #ebebeb;\n  line-height: 22px;\n  padding: 8px 8px 6px 10px;\n}\n\n.snackbar-animation {\n  animation: 2s showSnack;\n}\n\n@keyframes showSnack { from { opacity: 0; } to { opacity: 1; } }", "",{"version":3,"sources":["webpack://./src/css/index.css"],"names":[],"mappings":"AAKA;EACE,aAAa;EACb,sBAAsB;EACtB,uBAAuB;EACvB,mBAAmB;AACrB;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,YAAY;EACZ,iBAAiB;AACnB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,eAAe;EACf,gBAAgB;AAClB;;AAEA;EACE,yBAAyB;AAC3B;;AAEA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;AACrB;;AAEA;EACE,eAAe;EACf,kBAAkB;EAClB,YAAY;EACZ,kBAAkB;EAClB,iBAAiB;EACjB,eAAe;EACf,sBAAsB;AACxB;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,mBAAmB;EACnB,aAAa;AACf;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,qBAAqB;AACvB;;AAEA;;;EAGE,WAAW;EACX,YAAY;EACZ,eAAe;EACf,mBAAmB;EACnB,kBAAkB;EAClB,YAAY;EACZ,iBAAiB;EACjB,YAAY;EACZ,eAAe;AACjB;;AAEA;;;;EAIE,kBAAkB;EAClB,gBAAgB;AAClB;;AAEA;;;;;;;;EAQE,YAAY;EACZ,YAAY;EACZ,6BAA6B;EAC7B,gCAAgC;AAClC;;AAEA;;;EAGE,eAAe;EACf,mBAAmB;EACnB,kBAAkB;EAClB,YAAY;AACd;;AAEA;;EAEE,WAAW;AACb;;AAEA;;;EAGE,mBAAmB;AACrB;;AAEA;EACE,YAAY;EACZ,gBAAgB;EAChB,eAAe;EACf,YAAY;EACZ,UAAU;AACZ;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,yBAAyB;AAC3B;;AAEA;EACE,cAAc;EACd,iBAAiB;EACjB,yBAAyB;AAC3B;;AAEA;EACE,uBAAuB;AACzB;;AAEA,uBAAuB,OAAO,UAAU,EAAE,EAAE,KAAK,UAAU,EAAE,EAAE","sourcesContent":["@import \"./productPage.css\";\n@import \"./chargePage.css\";\n@import \"./purchasePage.css\";\n@import \"./memberPage.css\";\n\n#app {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n\ninput {\n  padding: 0;\n}\n\nbutton {\n  border: none;\n}\n\n.header {\n  width: 470px;\n}\n\n.header-text {\n  text-align: center;\n}\n\n.member-wrap {\n  float: right;\n  margin-top: -50px;\n}\n\n.member-login-button {\n  width: 60px;\n  height: 30px;\n  cursor: pointer;\n  font-weight: 800;\n}\n\n.member-login-button:hover {\n  background-color: #ebebeb;\n}\n\n.nav {\n  display: flex;\n  justify-content: center;\n  margin-bottom: 48px;\n}\n\n.button {\n  cursor: pointer;\n  border-radius: 4px;\n  border: none;\n  font-style: normal;\n  font-weight: bold;\n  font-size: 14px;\n  letter-spacing: 1.25px;\n}\n\n.nav__button {\n  width: 120px;\n  height: 36px;\n  background: #f5f5f5;\n  margin: 0 4px;\n}\n\n.nav__button:hover {\n  background: #ebebeb;\n}\n\n.button-click {\n  background: #00bcd41f;\n}\n\n#product-add-button,\n#charge-add-button,\n#insert-money-button {\n  width: 56px;\n  height: 38px;\n  cursor: pointer;\n  background: #00bcd4;\n  border-radius: 5px;\n  border: none;\n  margin-left: 16px;\n  color: white;\n  font-size: 16px;\n}\n\n#product-table-title,\n#charge-table-title,\n#purchase-product-table-title,\n#return-charge-table-title {\n  text-align: center;\n  margin-top: 40px;\n}\n\n#product-control-table td,\n#product-control-table th,\n#charge-control-table td,\n#charge-control-table th,\n#purchase-possible-product-table td,\n#purchase-possible-product-table th,\n#return-charge-table td,\n#return-charge-table th {\n  width: 118px;\n  height: 40px;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n}\n\n.product-edit-button,\n.product-remove-button,\n.product-confirm-button {\n  cursor: pointer;\n  background: #f5f5f5;\n  border-radius: 5px;\n  height: 32px;\n}\n\n.product-edit-button,\n.product-remove-button {\n  width: 50px;\n}\n\n.product-edit-button:hover,\n.product-remove-button:hover,\n.product-confirm-button:hover {\n  background: #ebebeb;\n}\n\n#snackbar-wrap {\n  width: 302px;\n  overflow: hidden;\n  position: fixed;\n  bottom: 10px;\n  left: 20px;\n}\n\n.snackbar {\n  width: 300px;\n  height: 60px;\n  background-color: #5c5c5c;\n}\n\n.snackbar-text {\n  color: #ebebeb;\n  line-height: 22px;\n  padding: 8px 8px 6px 10px;\n}\n\n.snackbar-animation {\n  animation: 2s showSnack;\n}\n\n@keyframes showSnack { from { opacity: 0; } to { opacity: 1; } }"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/memberPage.css":
/*!**********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/memberPage.css ***!
  \**********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#login-section,\n#signup-section {\n  display: flex;\n  flex-direction: column;\n  margin-top: 30px;\n}\n\n.member-page-main-text,\n.member-page-main-text {\n  margin: auto;\n  margin-bottom: 48px;\n}\n\n.member-info-form {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n\n.member-info-form-label {\n  width: 290px;\n  float: left;\n}\n\n.member-info-input {\n  width: 290px;\n  height: 36px;\n  margin: 4px 0 4px 0;\n  border: 1px solid #b7b7b7;\n  border-radius: 6px;\n  padding-left: 10px;\n}\n\n.member-info-message{\n  width: 290px;\n  height: 18px;\n  margin: 0 0 14px 0;\n  font-size: 14px;\n}\n\n.member-confirm-button {\n  width: 300px;\n  height: 36px;\n  background-color: #00BCD4;\n  border-radius: 6px;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.member-confirm-button:hover {\n  background: #ebebeb;\n}\n\n.signup-text{\n  cursor: pointer;\n  color: #3581D7;\n}\n\n.member-info-error-text {\n  color: #ff0000;\n}\n\n.member-info-correct-text {\n  color: #009eb3;\n}", "",{"version":3,"sources":["webpack://./src/css/memberPage.css"],"names":[],"mappings":"AAAA;;EAEE,aAAa;EACb,sBAAsB;EACtB,gBAAgB;AAClB;;AAEA;;EAEE,YAAY;EACZ,mBAAmB;AACrB;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,mBAAmB;AACrB;;AAEA;EACE,YAAY;EACZ,WAAW;AACb;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,mBAAmB;EACnB,yBAAyB;EACzB,kBAAkB;EAClB,kBAAkB;AACpB;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;AACjB;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,yBAAyB;EACzB,kBAAkB;EAClB,cAAc;EACd,eAAe;AACjB;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,eAAe;EACf,cAAc;AAChB;;AAEA;EACE,cAAc;AAChB;;AAEA;EACE,cAAc;AAChB","sourcesContent":["#login-section,\n#signup-section {\n  display: flex;\n  flex-direction: column;\n  margin-top: 30px;\n}\n\n.member-page-main-text,\n.member-page-main-text {\n  margin: auto;\n  margin-bottom: 48px;\n}\n\n.member-info-form {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n\n.member-info-form-label {\n  width: 290px;\n  float: left;\n}\n\n.member-info-input {\n  width: 290px;\n  height: 36px;\n  margin: 4px 0 4px 0;\n  border: 1px solid #b7b7b7;\n  border-radius: 6px;\n  padding-left: 10px;\n}\n\n.member-info-message{\n  width: 290px;\n  height: 18px;\n  margin: 0 0 14px 0;\n  font-size: 14px;\n}\n\n.member-confirm-button {\n  width: 300px;\n  height: 36px;\n  background-color: #00BCD4;\n  border-radius: 6px;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.member-confirm-button:hover {\n  background: #ebebeb;\n}\n\n.signup-text{\n  cursor: pointer;\n  color: #3581D7;\n}\n\n.member-info-error-text {\n  color: #ff0000;\n}\n\n.member-info-correct-text {\n  color: #009eb3;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/productPage.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/productPage.css ***!
  \***********************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".product-control-input {\n  width: 120px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n.product-control-form {\n  display: flex;\n}\n\n#product-control-table {\n  width: 470px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n}\n\n.product-confirm-button {\n  width: 100px;\n}\n\n.product-edit-input {\n  width: 70px;\n  height: 22px;\n}", "",{"version":3,"sources":["webpack://./src/css/productPage.css"],"names":[],"mappings":"AAAA;EACE,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,yBAAyB;EACzB,iBAAiB;EACjB,eAAe;EACf,eAAe;AACjB;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,6BAA6B;EAC7B,gCAAgC;EAChC,yBAAyB;AAC3B;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,WAAW;EACX,YAAY;AACd","sourcesContent":[".product-control-input {\n  width: 120px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n.product-control-form {\n  display: flex;\n}\n\n#product-control-table {\n  width: 470px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n}\n\n.product-confirm-button {\n  width: 100px;\n}\n\n.product-edit-input {\n  width: 70px;\n  height: 22px;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/purchasePage.css":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/purchasePage.css ***!
  \************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#insert-money-form-wrap {\n  width: 384px;\n  margin: auto;\n}\n\n.insert-money-input {\n  width: 300px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n#purchase-possible-product-table {\n  width: 470px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n}\n\n#return-charge-table {\n  width: 236px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n  margin: auto;\n}\n\n#return-money-button-wrap {\n  width: 100px;\n  margin: auto;\n  margin-top: 20px;\n}\n\n#return-money-button {\n  width: 100px;\n  height: 32px;\n  background-color: #F5F5F5;\n  cursor: pointer;\n}\n\n#return-money-button:hover {\n  background-color: #ebebeb;\n  align-items: center;\n  margin: auto;\n}\n\n.product-purchase-button {\n  width: 100px;\n  height: 32px;\n  background-color: #F5F5F5;\n  cursor: pointer;\n}\n\n.product-purchase-button:hover {\n  background-color: #ebebeb;\n}\n\n", "",{"version":3,"sources":["webpack://./src/css/purchasePage.css"],"names":[],"mappings":"AAAA;EACE,YAAY;EACZ,YAAY;AACd;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,yBAAyB;EACzB,iBAAiB;EACjB,eAAe;EACf,eAAe;AACjB;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,6BAA6B;EAC7B,gCAAgC;EAChC,yBAAyB;AAC3B;;AAEA;EACE,YAAY;EACZ,kBAAkB;EAClB,6BAA6B;EAC7B,gCAAgC;EAChC,yBAAyB;EACzB,YAAY;AACd;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,yBAAyB;EACzB,eAAe;AACjB;;AAEA;EACE,yBAAyB;EACzB,mBAAmB;EACnB,YAAY;AACd;;AAEA;EACE,YAAY;EACZ,YAAY;EACZ,yBAAyB;EACzB,eAAe;AACjB;;AAEA;EACE,yBAAyB;AAC3B","sourcesContent":["#insert-money-form-wrap {\n  width: 384px;\n  margin: auto;\n}\n\n.insert-money-input {\n  width: 300px;\n  height: 36px;\n  border-radius: 5px;\n  border: 1px solid #8b8b8b;\n  padding-left: 5px;\n  margin-top: 8px;\n  font-size: 16px;\n}\n\n#purchase-possible-product-table {\n  width: 470px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n}\n\n#return-charge-table {\n  width: 236px;\n  text-align: center;\n  border-top: 1px solid #dcdcdc;\n  border-bottom: 1px solid #dcdcdc;\n  border-collapse: collapse;\n  margin: auto;\n}\n\n#return-money-button-wrap {\n  width: 100px;\n  margin: auto;\n  margin-top: 20px;\n}\n\n#return-money-button {\n  width: 100px;\n  height: 32px;\n  background-color: #F5F5F5;\n  cursor: pointer;\n}\n\n#return-money-button:hover {\n  background-color: #ebebeb;\n  align-items: center;\n  margin: auto;\n}\n\n.product-purchase-button {\n  width: 100px;\n  height: 32px;\n  background-color: #F5F5F5;\n  cursor: pointer;\n}\n\n.product-purchase-button:hover {\n  background-color: #ebebeb;\n}\n\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/css/index.css":
/*!***************************!*\
  !*** ./src/css/index.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/ts/components/Vendingmachine.ts":
/*!*********************************************!*\
  !*** ./src/ts/components/Vendingmachine.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _charge_Charge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./charge/Charge */ "./src/ts/components/charge/Charge.ts");
/* harmony import */ var _menuTab_MenuTab__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menuTab/MenuTab */ "./src/ts/components/menuTab/MenuTab.ts");
/* harmony import */ var _product_Product__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./product/Product */ "./src/ts/components/product/Product.ts");
/* harmony import */ var _purchase_Purchase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./purchase/Purchase */ "./src/ts/components/purchase/Purchase.ts");
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _menuTab_menuTabTemplate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./menuTab/menuTabTemplate */ "./src/ts/components/menuTab/menuTabTemplate.ts");
/* harmony import */ var _login_login__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./login/login */ "./src/ts/components/login/login.ts");
/* harmony import */ var _signup_Signup__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./signup/Signup */ "./src/ts/components/signup/Signup.ts");








var Vendingmachine = /** @class */ (function () {
    function Vendingmachine() {
        var _this = this;
        this.convertTemplate = function (path) {
            var routes = {
                "#login": function () { return _this.login.render(); },
                "#signup": function () { return _this.signup.render(); },
                "#product": function () { return _this.product.render(); },
                "#charge": function () { return _this.charge.render(); },
                "#purchase": function () { return _this.purchase.render(); }
            };
            _this.menuTab.render(path);
            routes[path]();
        };
        var vendingmachineWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_4__.selectDom)("#app");
        vendingmachineWrap.insertAdjacentHTML("beforeend", "\n        <aside id=\"snackbar-wrap\"></aside>\n        <header class=\"header\">\n          <h1 class=\"header-text\">\uD83C\uDF7F \uC790\uD310\uAE30 \uD83C\uDF7F</h1> \n          <div class=\"member-wrap\">\n            <button class=\"member-login-button\">\uB85C\uADF8\uC778</button>\n          </div>\n          ".concat(_menuTab_menuTabTemplate__WEBPACK_IMPORTED_MODULE_5__.menuTabTemplate, "\n        </header>\n        <main class=\"main\"></main>\n      "));
        this.mountComponent();
        this.convertTemplate(location.hash || "#product");
        this.handleMenuStyle();
    }
    Vendingmachine.prototype.mountComponent = function () {
        var _this = this;
        this.login = new _login_login__WEBPACK_IMPORTED_MODULE_6__["default"](this.convertTemplate);
        this.signup = new _signup_Signup__WEBPACK_IMPORTED_MODULE_7__["default"](this.convertTemplate);
        this.menuTab = new _menuTab_MenuTab__WEBPACK_IMPORTED_MODULE_1__["default"](this.convertTemplate);
        this.product = new _product_Product__WEBPACK_IMPORTED_MODULE_2__["default"]();
        this.charge = new _charge_Charge__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.purchase = new _purchase_Purchase__WEBPACK_IMPORTED_MODULE_3__["default"]();
        if (!location.hash) {
            history.pushState({ path: "#product" }, null, "#product");
        }
        window.addEventListener("popstate", function () {
            _this.convertTemplate(location.hash || "#product");
            _this.handleMenuStyle();
        });
    };
    Vendingmachine.prototype.handleMenuStyle = function () {
        var navList = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_4__.selectDomAll)(".nav__button");
        navList.forEach(function (navButton) {
            return navButton.dataset.menu === location.hash
                ? navButton.classList.add("button-click")
                : navButton.classList.remove("button-click");
        });
    };
    return Vendingmachine;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vendingmachine);


/***/ }),

/***/ "./src/ts/components/charge/Charge.ts":
/*!********************************************!*\
  !*** ./src/ts/components/charge/Charge.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/validation */ "./src/ts/utils/validation.ts");
/* harmony import */ var _snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../snackbar/snackbar */ "./src/ts/components/snackbar/snackbar.ts");
/* harmony import */ var _snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../snackbar/snackbarTemplate */ "./src/ts/components/snackbar/snackbarTemplate.ts");
/* harmony import */ var _ChargeInfo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ChargeInfo */ "./src/ts/components/charge/ChargeInfo.ts");
/* harmony import */ var _ChargeView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ChargeView */ "./src/ts/components/charge/ChargeView.ts");






var Charge = /** @class */ (function () {
    function Charge() {
        var _this = this;
        this.handleInputAmount = function (e) {
            e.preventDefault();
            var charge = _this.chargeInput.valueAsNumber;
            (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateCharge)(charge);
            (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_3__.insertMoneyText)(charge));
            _this.chargeInfo.convertRandomCharge(charge);
            _this.chargeView.showRandomChargeResult(_this.chargeInfo.getCoinList(), _this.chargeInfo.getTotalCharge());
        };
        this.chargeInfo = new _ChargeInfo__WEBPACK_IMPORTED_MODULE_4__["default"]();
        this.chargeView = new _ChargeView__WEBPACK_IMPORTED_MODULE_5__["default"]();
    }
    Charge.prototype.bindChargeDom = function () {
        this.chargeForm = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#charge-control-form");
        this.chargeInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".charge-control-input");
        this.currentContainCharge = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#current-contain-charge");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.chargeForm, "submit", this.handleInputAmount);
    };
    Charge.prototype.render = function () {
        this.chargeView.renderChargeView();
        this.chargeView.showRandomChargeResult(this.chargeInfo.getCoinList(), this.chargeInfo.getTotalCharge());
        this.bindChargeDom();
    };
    return Charge;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Charge);


/***/ }),

/***/ "./src/ts/components/charge/ChargeInfo.ts":
/*!************************************************!*\
  !*** ./src/ts/components/charge/ChargeInfo.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ChargeInfo = /** @class */ (function () {
    function ChargeInfo() {
        this.coinsKindCount = this.getCoinList();
        this.totalCharge = this.getTotalCharge();
    }
    ChargeInfo.prototype.convertRandomCharge = function (charge) {
        var totalAmount = 0;
        this.totalCharge += charge;
        while (totalAmount !== charge) {
            var randomCoin = this.pickNumberInList();
            totalAmount += randomCoin;
            if (totalAmount > charge) {
                totalAmount -= randomCoin;
            }
            else if (totalAmount <= charge) {
                this.coinsKindCount[randomCoin]++;
            }
        }
        this.setCoinList();
        this.setTotalCharge();
    };
    ChargeInfo.prototype.pickNumberInList = function () {
        var coinList = [10, 50, 100, 500];
        var randomNumber = Math.floor(Math.random() * coinList.length);
        return coinList[randomNumber];
    };
    ChargeInfo.prototype.setCoinList = function () {
        localStorage.setItem("COIN_LIST", JSON.stringify(this.coinsKindCount));
    };
    ChargeInfo.prototype.getCoinList = function () {
        return JSON.parse(localStorage.getItem("COIN_LIST")) || { 10: 0, 50: 0, 100: 0, 500: 0 };
    };
    ChargeInfo.prototype.setTotalCharge = function () {
        localStorage.setItem("TOTAL_CHARGE", JSON.stringify(this.totalCharge));
    };
    ChargeInfo.prototype.getTotalCharge = function () {
        return JSON.parse(localStorage.getItem("TOTAL_CHARGE")) || 0;
    };
    return ChargeInfo;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ChargeInfo);


/***/ }),

/***/ "./src/ts/components/charge/ChargeView.ts":
/*!************************************************!*\
  !*** ./src/ts/components/charge/ChargeView.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _chargeTemplate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chargeTemplate */ "./src/ts/components/charge/chargeTemplate.ts");


var ChargeView = /** @class */ (function () {
    function ChargeView() {
        this.vendingmachineFunctionWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".main");
    }
    ChargeView.prototype.showRandomChargeResult = function (coinsKindCount, totalCharge) {
        var currentContainCharge = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#current-contain-charge", this.vendingmachineFunctionWrap);
        var chargeResult = Object.values(coinsKindCount).reverse();
        var chargeCoinCount = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".charge-coin-count", this.vendingmachineFunctionWrap);
        currentContainCharge.textContent = "".concat(totalCharge);
        chargeCoinCount.forEach(function (coinCount, index) {
            return (coinCount.innerText = "".concat(chargeResult[index], "\uAC1C"));
        });
    };
    ChargeView.prototype.renderChargeView = function () {
        this.vendingmachineFunctionWrap.replaceChildren();
        this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", _chargeTemplate__WEBPACK_IMPORTED_MODULE_1__.chargeTemplate);
    };
    return ChargeView;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ChargeView);


/***/ }),

/***/ "./src/ts/components/charge/chargeTemplate.ts":
/*!****************************************************!*\
  !*** ./src/ts/components/charge/chargeTemplate.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "chargeTemplate": () => (/* binding */ chargeTemplate)
/* harmony export */ });
var chargeTemplate = "\n  <section id=\"charge-control-section\">\n    <div>\n      <form id=\"charge-control-form\">\n        <label>\uC790\uD310\uAE30\uAC00 \uBCF4\uC720\uD560 \uAE08\uC561\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.</label>\n          <div>\n            <input type=\"number\" placeholder=\"\uAE08\uC561\" value=\"\" class=\"charge-control-input\" />\n            <button type=\"submit\" id=\"charge-add-button\">\uCDA9\uC804</button>\n          </div>\n      </form>  \n    </div>\n    <div>\n      <p>\uD604\uC7AC \uBCF4\uC720 \uAE08\uC561: <span id=\"current-contain-charge\"></span>\uC6D0</p>\n    </div>\n    <div>\n      <h1 id=\"charge-table-title\">\uC790\uD310\uAE30\uAC00 \uBCF4\uC720\uD55C \uB3D9\uC804</h1>\n      <table id=\"charge-control-table\">\n        <tr> \n          <th>\uB3D9\uC804</th>\n          <th>\uAC1C\uC218</th>\n        </tr>\n        <tr>\n          <td>500\uC6D0</td>\n          <td class=\"charge-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>100\uC6D0</td>\n          <td class=\"charge-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>50\uC6D0</td>\n          <td class=\"charge-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>10\uC6D0</td>\n          <td class=\"charge-coin-count\">0\uAC1C</td>\n        </tr>\n      </table>\n    </div>\n  </section>";



/***/ }),

/***/ "./src/ts/components/login/login.ts":
/*!******************************************!*\
  !*** ./src/ts/components/login/login.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _loginTemplate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loginTemplate */ "./src/ts/components/login/loginTemplate.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var Login = /** @class */ (function () {
    function Login(convertTemplate) {
        var _this = this;
        this.convertTemplate = convertTemplate;
        this.handleLoginForm = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var _a, emailInput, passwordInput, emailInputValue, passwordValue, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        event.preventDefault();
                        _a = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.selectDomAll)(".member-info-input"), emailInput = _a[0], passwordInput = _a[1];
                        emailInputValue = emailInput.value;
                        passwordValue = passwordInput.value;
                        return [4 /*yield*/, axios__WEBPACK_IMPORTED_MODULE_0___default().post("https://vendingdb.herokuapp.com/login", {
                                body: JSON.stringify({
                                    email: emailInputValue,
                                    password: passwordValue
                                }),
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        console.log(response);
                        return [2 /*return*/];
                }
            });
        }); };
        this.handleSignupText = function () {
            history.pushState({ path: "#signup" }, null, "#signup");
            _this.convertTemplate("#signup");
        };
        this.convertTemplate = convertTemplate;
        this.vendingmachineFunctionWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.selectDom)(".main");
    }
    Login.prototype.bindLoginDom = function () {
        var signupText = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.selectDom)(".signup-text");
        var loginForm = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.selectDom)("#login-form");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.addEvent)(signupText, "click", this.handleSignupText);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_1__.addEvent)(loginForm, "submit", this.handleLoginForm);
    };
    Login.prototype.render = function () {
        this.vendingmachineFunctionWrap.replaceChildren();
        this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", _loginTemplate__WEBPACK_IMPORTED_MODULE_2__.loginTemplate);
        this.bindLoginDom();
    };
    return Login;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Login);


/***/ }),

/***/ "./src/ts/components/login/loginTemplate.ts":
/*!**************************************************!*\
  !*** ./src/ts/components/login/loginTemplate.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loginTemplate": () => (/* binding */ loginTemplate)
/* harmony export */ });
var loginTemplate = "\n  <section id=\"login-section\">\n    <h1 class=\"member-page-main-text\">\uB85C\uADF8\uC778</h1>\n    <form class=\"member-info-form\" id=\"login-form\">\n      <label class=\"member-info-form-label\">\uC774\uBA54\uC77C</label>\n      <input class=\"member-info-input\" placeholder=\"example@gmail.com\" type=\"email\" />\n      <label class=\"member-info-form-label\">\uBE44\uBC00\uBC88\uD638</label>\n      <input class=\"member-info-input\" placeholder=\"\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694\" type=\"password\" autocomplete=\"off\" minlength=\"8\" maxlength=\"16\" />\n      <button class=\"member-confirm-button\" tpye=\"submit\">\uD655\uC778</button>\n    </form>\n    <p>\uC544\uC9C1 \uD68C\uC6D0\uC774 \uC544\uB2C8\uC2E0\uAC00\uC694? <span class=\"signup-text\">\uD68C\uC6D0\uAC00\uC785</span></p>\n  </section>\n";



/***/ }),

/***/ "./src/ts/components/menuTab/MenuTab.ts":
/*!**********************************************!*\
  !*** ./src/ts/components/menuTab/MenuTab.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _menuTabTemplate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menuTabTemplate */ "./src/ts/components/menuTab/menuTabTemplate.ts");


var MenuTab = /** @class */ (function () {
    function MenuTab(convertTemplate) {
        var _this = this;
        this.convertTemplate = convertTemplate;
        this.handleMemberLoginButton = function (event) {
            if (!event.target.classList.contains("member-login-button")) {
                return;
            }
            history.pushState({ path: "#login" }, null, "#login");
            _this.convertTemplate("#login");
        };
        this.handleMenuTab = function (e) {
            if (!e.target.classList.contains("nav__button")) {
                return;
            }
            var navList = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".nav__button");
            if (e.target.dataset.menu ===
                navList.find(function (navButton) { return navButton.classList.contains("button-click"); }).dataset.menu) {
                return;
            }
            navList.forEach(function (navButton) {
                return navButton.dataset.menu === e.target.dataset.menu
                    ? navButton.classList.add("button-click")
                    : navButton.classList.remove("button-click");
            });
            history.pushState({ path: e.target.dataset.menu }, null, e.target.dataset.menu);
            _this.convertTemplate(location.hash);
        };
        this.convertTemplate = convertTemplate;
        this.vendingmachineWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#app");
        this.vendingmachineHeader = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".header");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.vendingmachineWrap, "click", this.handleMenuTab);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.vendingmachineHeader, "click", this.handleMemberLoginButton);
    }
    MenuTab.prototype.render = function (path) {
        if (path === "#login" || path === "#signup") {
            this.vendingmachineHeader.replaceChildren();
            return;
        }
        if (this.vendingmachineHeader.children.length === 0) {
            this.vendingmachineHeader.insertAdjacentHTML("beforeend", "<h1 class=\"header-text\">\uD83C\uDF7F \uC790\uD310\uAE30 \uD83C\uDF7F</h1> \n          <div class=\"member-wrap\">\n            <button class=\"member-login-button\">\uB85C\uADF8\uC778</button>\n          </div>\n          ".concat(_menuTabTemplate__WEBPACK_IMPORTED_MODULE_1__.menuTabTemplate));
        }
    };
    return MenuTab;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MenuTab);


/***/ }),

/***/ "./src/ts/components/menuTab/menuTabTemplate.ts":
/*!******************************************************!*\
  !*** ./src/ts/components/menuTab/menuTabTemplate.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "menuTabTemplate": () => (/* binding */ menuTabTemplate)
/* harmony export */ });
var menuTabTemplate = "\n  <nav class=\"nav\"> \n    <button type=\"button\" class=\"button nav__button button-click\" data-menu=\"#product\">\n      \uC0C1\uD488 \uAD00\uB9AC\n    </button> \n    <button type=\"button\" class=\"button nav__button\" data-menu=\"#charge\">\n      \uC794\uB3C8 \uCDA9\uC804\n    </button> \n    <button type=\"button\" class=\"button nav__button\" data-menu=\"#purchase\">\n      \uC0C1\uD488 \uAD6C\uB9E4\n    </button> \n  </nav>";



/***/ }),

/***/ "./src/ts/components/product/Product.ts":
/*!**********************************************!*\
  !*** ./src/ts/components/product/Product.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _snackbar_snackbar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../snackbar/snackbar */ "./src/ts/components/snackbar/snackbar.ts");
/* harmony import */ var _snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../snackbar/snackbarTemplate */ "./src/ts/components/snackbar/snackbarTemplate.ts");
/* harmony import */ var _ProductInfo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ProductInfo */ "./src/ts/components/product/ProductInfo.ts");
/* harmony import */ var _ProductView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ProductView */ "./src/ts/components/product/ProductView.ts");





var Product = /** @class */ (function () {
    function Product() {
        var _this = this;
        this.handleControlProduct = function (event) {
            if (event.target.classList.contains("product-remove-button")) {
                _this.handleRemoveProduct(event);
            }
            else if (event.target.classList.contains("product-edit-button")) {
                _this.handleEditProduct(event);
            }
            else if (event.target.classList.contains("product-confirm-button")) {
                _this.handleConfirmProduct(event);
            }
        };
        this.handleAddProduct = function (event) {
            event.preventDefault();
            var _a = _this.productInfoInputs.map(function (input) { return input.value; }), productName = _a[0], productPrice = _a[1], productQuantity = _a[2];
            _this.productInfo.validateProductInfo({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity });
            (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_1__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_2__.registerProductText)({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity }));
            _this.productInfo.addProductList({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity });
            _this.productView.changeProductInfoInputEmpty();
            _this.productView.focusProductNameInput();
            _this.productView.addProduct({
                productName: productName,
                productPrice: +productPrice,
                productQuantity: +productQuantity
            });
        };
        this.handleRemoveProduct = function (event) {
            if (!confirm("정말 삭제하시겠습니까?")) {
                return;
            }
            ;
            var productNameTd = Array.from(event.target.closest("tr").children)[0];
            (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_1__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_2__.deleteProductText)(productNameTd.textContent));
            _this.productInfo.removeProduct(productNameTd.textContent);
            _this.productView.removeProduct(event.target);
        };
        this.handleEditProduct = function (event) {
            _this.productView.prepareEditProduct(event.target);
            _this.productView.focusProductEditInput();
        };
        this.handleConfirmProduct = function (event) {
            var _a = Array.from((0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-edit-input", event.target.closest("tr")), function (input) { return input.value; }), productName = _a[0], productPrice = _a[1], productQuantity = _a[2];
            var beforeProductName = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".product-name", event.target.closest("tr")).dataset.name;
            _this.productInfo.validateEditProductInfo({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity, beforeProductName: beforeProductName });
            (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_1__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_2__.editProductInfoText)({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity }));
            _this.productView.editProduct({ target: event.target, productName: productName, productPrice: +productPrice, productQuantity: +productQuantity });
            var changeProductIndex = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-name", _this.productTable)
                .map(function (productTd) { return productTd.textContent; })
                .indexOf(productName);
            _this.productInfo.editProduct({ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity, changeProductIndex: changeProductIndex });
        };
        this.productInfo = new _ProductInfo__WEBPACK_IMPORTED_MODULE_3__["default"]();
        this.productView = new _ProductView__WEBPACK_IMPORTED_MODULE_4__["default"]();
        this.productView.renderProductView();
    }
    Product.prototype.bindProductDom = function () {
        this.productInfoInputs = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-control-input");
        this.productAddButton = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#product-add-button");
        this.productTable = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#product-control-table");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.productAddButton, "click", this.handleAddProduct);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.productTable, "click", this.handleControlProduct);
        this.productView.focusProductNameInput();
    };
    Product.prototype.render = function () {
        this.productView.renderProductView();
        this.productView.showProductList(this.productInfo.getProductList());
        this.bindProductDom();
    };
    return Product;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Product);


/***/ }),

/***/ "./src/ts/components/product/ProductInfo.ts":
/*!**************************************************!*\
  !*** ./src/ts/components/product/ProductInfo.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/validation */ "./src/ts/utils/validation.ts");
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var ProductInfo = /** @class */ (function () {
    function ProductInfo() {
        this.productList = this.getProductList();
    }
    ProductInfo.prototype.validateProductInfo = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
        var productNameList = this.productList.map(function (product) { return product.productName; });
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateProductName)(productName);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateProductPrice)(+productPrice);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.valudateProductQuantity)(+productQuantity);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateSameProductName)(productName, productNameList);
    };
    ProductInfo.prototype.validateEditProductInfo = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity, beforeProductName = _a.beforeProductName;
        var productNameList = this.productList
            .map(function (product) { return product.productName; })
            .filter(function (productName) { return productName !== beforeProductName; });
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateProductName)(productName);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateProductPrice)(+productPrice);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.valudateProductQuantity)(+productQuantity);
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_0__.validateSameProductName)(productName, productNameList);
    };
    ProductInfo.prototype.addProductList = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
        this.productList = __spreadArray(__spreadArray([], this.productList, true), [{ productName: productName, productPrice: +productPrice, productQuantity: +productQuantity }], false);
        this.setProductList();
    };
    ProductInfo.prototype.removeProduct = function (removeProductText) {
        this.productList = this.productList.filter(function (product) { return product.productName !== removeProductText; });
        this.setProductList();
    };
    ProductInfo.prototype.editProduct = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity, changeProductIndex = _a.changeProductIndex;
        this.productList[changeProductIndex].productName = productName;
        this.productList[changeProductIndex].productPrice = productPrice;
        this.productList[changeProductIndex].productQuantity = productQuantity;
        this.setProductList();
    };
    ProductInfo.prototype.setProductList = function () {
        localStorage.setItem("PRODUCTS", JSON.stringify(this.productList));
    };
    ProductInfo.prototype.getProductList = function () {
        return JSON.parse(localStorage.getItem("PRODUCTS")) || [];
    };
    return ProductInfo;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductInfo);


/***/ }),

/***/ "./src/ts/components/product/ProductView.ts":
/*!**************************************************!*\
  !*** ./src/ts/components/product/ProductView.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _productTemplate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./productTemplate */ "./src/ts/components/product/productTemplate.ts");


var ProductView = /** @class */ (function () {
    function ProductView() {
        this.vendingmachineFunctionWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".main");
    }
    ProductView.prototype.addProduct = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
        this.productTable.insertAdjacentHTML("beforeend", (0,_productTemplate__WEBPACK_IMPORTED_MODULE_1__.addProductTemplate)({
            productName: productName,
            productPrice: +productPrice,
            productQuantity: +productQuantity
        }));
    };
    ProductView.prototype.removeProduct = function (target) {
        target.closest("tr").remove();
    };
    ProductView.prototype.prepareEditProduct = function (target) {
        var _a = Array.from(target.closest("tr").children), productNameTd = _a[0], productPriceTd = _a[1], productQuantityTd = _a[2];
        target.closest("tr").innerHTML = (0,_productTemplate__WEBPACK_IMPORTED_MODULE_1__.editProductTemplate)({
            productName: productNameTd.textContent,
            productPrice: +productPriceTd.textContent,
            productQuantity: +productQuantityTd.textContent
        });
    };
    ProductView.prototype.editProduct = function (_a) {
        var target = _a.target, productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
        target.closest("tr").innerHTML = (0,_productTemplate__WEBPACK_IMPORTED_MODULE_1__.addProductTemplate)({
            productName: productName,
            productPrice: productPrice,
            productQuantity: productQuantity
        });
    };
    ProductView.prototype.focusProductNameInput = function () {
        this.productInfoInputs = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-control-input");
        var productNameInput = this.productInfoInputs[0];
        productNameInput.focus();
    };
    ProductView.prototype.focusProductEditInput = function () {
        var productEditInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-edit-input")[0];
        productEditInput.focus();
    };
    ProductView.prototype.changeProductInfoInputEmpty = function () {
        this.productInfoInputs.forEach(function (input) { return (input.value = ""); });
    };
    ProductView.prototype.showProductList = function (productList) {
        this.productTable.insertAdjacentHTML("beforeend", productList.map(function (product) { return (0,_productTemplate__WEBPACK_IMPORTED_MODULE_1__.addProductTemplate)(product); }).join(' '));
    };
    ;
    ProductView.prototype.renderProductView = function () {
        this.vendingmachineFunctionWrap.replaceChildren();
        this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", _productTemplate__WEBPACK_IMPORTED_MODULE_1__.productTemplate);
        this.productTable = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#product-control-table");
    };
    return ProductView;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductView);


/***/ }),

/***/ "./src/ts/components/product/productTemplate.ts":
/*!******************************************************!*\
  !*** ./src/ts/components/product/productTemplate.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "productTemplate": () => (/* binding */ productTemplate),
/* harmony export */   "addProductTemplate": () => (/* binding */ addProductTemplate),
/* harmony export */   "editProductTemplate": () => (/* binding */ editProductTemplate)
/* harmony export */ });
var productTemplate = "\n  <section id=\"product-control-section\">\n    <div>\n      <form id=\"product-control-form\">\n        <label>\uCD94\uAC00\uD560 \uC0C1\uD488 \uC815\uBCF4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.</label>\n          <div>\n            <input placeholder=\"\uC0C1\uD488\uBA85\" class=\"product-control-input\" />\n            <input type=\"number\" placeholder=\"\uAC00\uACA9\" class=\"product-control-input\" />\n            <input type=\"number\" placeholder=\"\uC218\uB7C9\" class=\"product-control-input\" />\n            <button type=\"submit\" id=\"product-add-button\">\uCD94\uAC00</button>\n          </div>\n      </form>  \n    </div>\n    <div>\n      <h1 id=\"product-table-title\">\uC0C1\uD488 \uD604\uD669</h1>\n      <table id=\"product-control-table\">\n        <tr>\n          <th>\uC0C1\uD488\uBA85</th>\n          <th>\uAC00\uACA9</th>\n          <th>\uC218\uB7C9</th>\n          <th></th>\n        </tr>\n      </table>\n    </div>\n  </section>";
var addProductTemplate = function (_a) {
    var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
    return "\n    <tr>\n      <td class=\"product-name\">".concat(productName, "</td>\n      <td>").concat(productPrice, "</td>\n      <td>").concat(productQuantity, "</td>\n      <td>\n        <button type=\"button\" class=\"product-edit-button\">\uC218\uC815</button>\n        <button type=\"button\" class=\"product-remove-button\">\uC81C\uAC70</button>\n      </td>\n    </tr>");
};
var editProductTemplate = function (_a) {
    var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
    return "\n    <td class=\"product-name\" data-name=\"".concat(productName, "\" ><input class=\"product-edit-input\" value=\"").concat(productName, "\" /></td>\n    <td><input class=\"product-edit-input\" value='").concat(productPrice, "' /></td>\n    <td><input class=\"product-edit-input\" value='").concat(productQuantity, "' /></td>\n    <td><button type=\"button\" class=\"product-confirm-button\">\uD655\uC778</button></td>\n  ");
};



/***/ }),

/***/ "./src/ts/components/purchase/Purchase.ts":
/*!************************************************!*\
  !*** ./src/ts/components/purchase/Purchase.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/validation */ "./src/ts/utils/validation.ts");
/* harmony import */ var _snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../snackbar/snackbar */ "./src/ts/components/snackbar/snackbar.ts");
/* harmony import */ var _snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../snackbar/snackbarTemplate */ "./src/ts/components/snackbar/snackbarTemplate.ts");
/* harmony import */ var _PurchaseInfo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PurchaseInfo */ "./src/ts/components/purchase/PurchaseInfo.ts");
/* harmony import */ var _PurchaseView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PurchaseView */ "./src/ts/components/purchase/PurchaseView.ts");






var Purchase = /** @class */ (function () {
    function Purchase() {
        var _this = this;
        this.handleInsertMoney = function (event) {
            event.preventDefault();
            var insertMoney = _this.insertMoneyInput.valueAsNumber;
            (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateCharge)(insertMoney);
            (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_3__.insertMoneyText)(insertMoney));
            _this.purchaseInfo.plusInsertMoney(insertMoney);
            _this.purchaseView.showInsertMoney(_this.purchaseInfo.getInsertMoney());
        };
        this.handlePurchaseProduct = function (event) {
            if (event.target.classList.contains("product-purchase-button")) {
                var _a = Array.from(event.target.closest("tr").children), productNameTd = _a[0], productPriceTd = _a[1];
                _this.purchaseInfo.purchaseProduct({ productName: productNameTd.textContent, productPrice: +productPriceTd.textContent });
                (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__.showSnackbar)((0,_snackbar_snackbarTemplate__WEBPACK_IMPORTED_MODULE_3__.purchaseProductText)(productNameTd.textContent));
                _this.purchaseView.showInsertMoney(_this.purchaseInfo.insertMoney);
                _this.purchaseView.editPurchaseProductQuantity(productNameTd.textContent);
            }
        };
        this.handleReturnMoney = function () {
            _this.purchaseInfo.returnCharge();
            _this.purchaseView.showReturnCharge(_this.purchaseInfo.returnCoinsKindCount);
            _this.purchaseView.showInsertMoney(_this.purchaseInfo.insertMoney);
        };
        this.purchaseInfo = new _PurchaseInfo__WEBPACK_IMPORTED_MODULE_4__["default"]();
        this.purchaseView = new _PurchaseView__WEBPACK_IMPORTED_MODULE_5__["default"]();
    }
    Purchase.prototype.bindPurchaseDom = function () {
        this.insertMoneyForm = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#insert-money-form");
        this.insertMoneyInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".insert-money-input");
        this.insertMoneyText = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#insert-money-text");
        this.purchasePossibleProductTable = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#purchase-possible-product-table");
        this.returnMoneyButton = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#return-money-button");
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.insertMoneyForm, "submit", this.handleInsertMoney);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.purchasePossibleProductTable, "click", this.handlePurchaseProduct);
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(this.returnMoneyButton, "click", this.handleReturnMoney);
    };
    Purchase.prototype.render = function () {
        this.purchaseView.renderPurchaseView();
        this.purchaseView.showInsertMoney(this.purchaseInfo.insertMoney);
        this.purchaseInfo.updateProductList();
        this.purchaseView.showPurchasePossibleProduct(this.purchaseInfo.productList);
        this.bindPurchaseDom();
    };
    return Purchase;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Purchase);


/***/ }),

/***/ "./src/ts/components/purchase/PurchaseInfo.ts":
/*!****************************************************!*\
  !*** ./src/ts/components/purchase/PurchaseInfo.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/constants */ "./src/ts/utils/constants.ts");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/validation */ "./src/ts/utils/validation.ts");


var PurchaseInfo = /** @class */ (function () {
    function PurchaseInfo() {
        this.updateProductList();
        this.insertMoney = this.getInsertMoney();
    }
    PurchaseInfo.prototype.returnCharge = function () {
        if (this.insertMoney % _utils_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.RETURN_CHARGE_UNIT === 0) {
            throw new Error("지폐는 잔돈으로 반환할 수 없습니다.");
        }
        this.calulateReturnCharge(this.insertMoney % _utils_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.RETURN_CHARGE_UNIT);
        this.insertMoney -= this.insertMoney % _utils_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.RETURN_CHARGE_UNIT;
        this.setInsertMoney();
        this.setCoinList();
    };
    PurchaseInfo.prototype.calulateReturnCharge = function (returnCharge) {
        this.returnCoinsKindCount = { 10: 0, 50: 0, 100: 0, 500: 0 };
        this.coinsKindCount = this.getCoinList();
        while (returnCharge !== 0) {
            if (returnCharge >= 500 && this.coinsKindCount[500] > 0) {
                returnCharge -= 500;
                this.coinsKindCount[500] -= 1;
                this.returnCoinsKindCount[500] += 1;
            }
            else if (returnCharge >= 100 && this.coinsKindCount[100] > 0) {
                returnCharge -= 100;
                this.coinsKindCount[100] -= 1;
                this.returnCoinsKindCount[100] += 1;
            }
            else if (returnCharge >= 50 && this.coinsKindCount[50] > 0) {
                returnCharge -= 50;
                this.coinsKindCount[50] -= 1;
                this.returnCoinsKindCount[50] += 1;
            }
            else if (returnCharge >= 10) {
                if (this.coinsKindCount[10] > 0) {
                    returnCharge -= 10;
                    this.coinsKindCount[10] -= 1;
                    this.returnCoinsKindCount[10] += 1;
                }
                else if (this.coinsKindCount[10] === 0) {
                    break;
                }
            }
        }
    };
    PurchaseInfo.prototype.updateProductList = function () {
        this.productList = this.getProductList();
    };
    PurchaseInfo.prototype.purchaseProduct = function (_a) {
        var productName = _a.productName, productPrice = _a.productPrice;
        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validatePossiblePurchaseProduct)({ totalMoney: this.insertMoney, productPrice: productPrice });
        this.productList.find(function (product) { return product.productName === productName; }).productQuantity -= 1;
        this.insertMoney -= productPrice;
        this.setProductList();
        this.setInsertMoney();
    };
    PurchaseInfo.prototype.plusInsertMoney = function (money) {
        this.insertMoney += money;
        this.setInsertMoney();
    };
    PurchaseInfo.prototype.setInsertMoney = function () {
        localStorage.setItem("INSERT_MONEY", JSON.stringify(this.insertMoney));
    };
    PurchaseInfo.prototype.getInsertMoney = function () {
        return JSON.parse(localStorage.getItem("INSERT_MONEY")) || 0;
    };
    PurchaseInfo.prototype.setProductList = function () {
        localStorage.setItem("PRODUCTS", JSON.stringify(this.productList));
    };
    PurchaseInfo.prototype.getProductList = function () {
        return JSON.parse(localStorage.getItem("PRODUCTS")) || [];
    };
    PurchaseInfo.prototype.setCoinList = function () {
        localStorage.setItem("COIN_LIST", JSON.stringify(this.coinsKindCount));
    };
    PurchaseInfo.prototype.getCoinList = function () {
        return JSON.parse(localStorage.getItem("COIN_LIST")) || { 10: 0, 50: 0, 100: 0, 500: 0 };
    };
    return PurchaseInfo;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PurchaseInfo);


/***/ }),

/***/ "./src/ts/components/purchase/PurchaseView.ts":
/*!****************************************************!*\
  !*** ./src/ts/components/purchase/PurchaseView.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _purchaseTemplate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./purchaseTemplate */ "./src/ts/components/purchase/purchaseTemplate.ts");


var PurchaseView = /** @class */ (function () {
    function PurchaseView() {
        this.vendingmachineFunctionWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".main");
    }
    PurchaseView.prototype.showInsertMoney = function (totalMoney) {
        var insertMoneyText = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#insert-money-text", this.vendingmachineFunctionWrap);
        insertMoneyText.textContent = "".concat(totalMoney);
    };
    PurchaseView.prototype.showPurchasePossibleProduct = function (productList) {
        var purchasePossibleProductTable = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#purchase-possible-product-table", this.vendingmachineFunctionWrap);
        purchasePossibleProductTable.insertAdjacentHTML("beforeend", productList.map(function (product) { return (0,_purchaseTemplate__WEBPACK_IMPORTED_MODULE_1__.purchasePossibleProductTemplate)(product); }).join(" "));
    };
    PurchaseView.prototype.editPurchaseProductQuantity = function (productName) {
        var _a = Array.from((0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".product-name", this.vendingmachineFunctionWrap)
            .find(function (productNameTd) { return productNameTd.textContent === productName; })
            .closest("tr")
            .children), productQuantity = _a[2], purchaseButton = _a[3];
        productQuantity.textContent = "".concat(+productQuantity.textContent - 1);
        if (+productQuantity.textContent === 0) {
            purchaseButton.textContent = "품절";
        }
    };
    PurchaseView.prototype.showReturnCharge = function (returnCoinsKindCount) {
        var returnChargeCoinCount = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".return-coin-count", this.vendingmachineFunctionWrap);
        var returnCoinsResult = Object.values(returnCoinsKindCount).reverse();
        returnChargeCoinCount.forEach(function (returnCoinCount, index) {
            return (returnCoinCount.innerText = "".concat(returnCoinsResult[index], "\uAC1C"));
        });
    };
    PurchaseView.prototype.renderPurchaseView = function () {
        this.vendingmachineFunctionWrap.replaceChildren();
        this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", _purchaseTemplate__WEBPACK_IMPORTED_MODULE_1__.purchaseTemplate);
    };
    return PurchaseView;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PurchaseView);


/***/ }),

/***/ "./src/ts/components/purchase/purchaseTemplate.ts":
/*!********************************************************!*\
  !*** ./src/ts/components/purchase/purchaseTemplate.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "purchaseTemplate": () => (/* binding */ purchaseTemplate),
/* harmony export */   "purchasePossibleProductTemplate": () => (/* binding */ purchasePossibleProductTemplate)
/* harmony export */ });
var purchaseTemplate = "\n  <section id=\"purchase-product-section\">\n    <div id=\"insert-money-form-wrap\">\n      <form id=\"insert-money-form\">\n        <label>\uC0C1\uD488\uC744 \uAD6C\uB9E4\uD560 \uAE08\uC561\uC744 \uD22C\uC785\uD574\uC8FC\uC138\uC694</label>\n        <div>\n          <input type=\"number\" placeholder=\"\uAE08\uC561\" class=\"insert-money-input\" />\n          <button type=\"submit\" id=\"insert-money-button\">\uD22C\uC785</button>\n        </div>\n      </form>\n      <p>\uD22C\uC785\uD55C \uAE08\uC561 : <span id=\"insert-money-text\">0</span>\uC6D0</p></div>\n    </div>\n      <h1 id=\"purchase-product-table-title\">\uAD6C\uB9E4 \uAC00\uB2A5 \uC0C1\uD488 \uD604\uD669</h1>\n      <table id=\"purchase-possible-product-table\">\n        <tr> \n          <th>\uC0C1\uD488\uBA85</th>\n          <th>\uAC00\uACA9</th>\n          <th>\uC218\uB7C9</th>\n          <th>\uAD6C\uB9E4</th>\n        </tr>\n      </table>\n    </div>\n    <div>\n      <h1 id=\"return-charge-table-title\">\uC794\uB3C8 \uBC18\uD658</h1>\n      <table id=\"return-charge-table\">\n        <tr> \n          <th>\uB3D9\uC804</th>\n          <th>\uAC1C\uC218</th>\n        </tr>\n        <tr>\n          <td>500\uC6D0</td>\n          <td class=\"return-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>100\uC6D0</td>\n          <td class=\"return-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>50\uC6D0</td>\n          <td class=\"return-coin-count\">0\uAC1C</td>\n        </tr>\n        <tr>\n          <td>10\uC6D0</td>\n          <td class=\"return-coin-count\">0\uAC1C</td>\n        </tr>\n      </table>\n    </div>\n    <div id=\"return-money-button-wrap\">\n      <button type=\"button\" id=\"return-money-button\">\uBC18\uD658</button>\n    </div>\n  </section>";
var purchasePossibleProductTemplate = function (_a) {
    var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
    return "\n    <tr>\n      <td class=\"product-name\">".concat(productName, "</td>\n      <td>").concat(productPrice, "</td>\n      <td>").concat(productQuantity, "</td>\n      <td>\n        <button type=\"button\" class=\"product-purchase-button\">\uAD6C\uB9E4</button>\n      </td>\n    </tr>");
};



/***/ }),

/***/ "./src/ts/components/signup/Signup.ts":
/*!********************************************!*\
  !*** ./src/ts/components/signup/Signup.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/validation */ "./src/ts/utils/validation.ts");
/* harmony import */ var _snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../snackbar/snackbar */ "./src/ts/components/snackbar/snackbar.ts");
/* harmony import */ var _signupTemplate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./signupTemplate */ "./src/ts/components/signup/signupTemplate.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var Signup = /** @class */ (function () {
    function Signup(convertTemplate) {
        var _this = this;
        this.convertTemplate = convertTemplate;
        this.bindSignupDom = function () {
            var signupForm = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".member-info-form");
            _this.signupInputList = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDomAll)(".member-info-input");
            _this.emailInfoInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#email-info-input");
            _this.nameInfoInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#name-info-input");
            _this.passwordInfoInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#password-info-input");
            _this.passwordConfirmInfoInput = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#password-confirm-info-input");
            _this.emailInfoMessage = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#email-info-message");
            _this.nameInfoMessage = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#name-info-message");
            _this.passwordInfoMessage = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#password-info-message");
            _this.passwordConfirmInfoMessage = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#password-confirm-info-message");
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(signupForm, "submit", _this.handleSubmitSignup);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.emailInfoInput, "keydown", _this.handleEmailInputKeyEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.emailInfoInput, "focusout", _this.handleEmailInputMouseEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.nameInfoInput, "keydown", _this.handleNameInputKeyEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.nameInfoInput, "focusout", _this.handleNameInputMouseEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.passwordInfoInput, "keydown", _this.handlePasswordInputKeyEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.passwordInfoInput, "focusout", _this.handlePasswordInputMouseEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.passwordConfirmInfoInput, "keydown", _this.handlePasswordConfirmInputKeyEvent);
            (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addEvent)(_this.passwordConfirmInfoInput, "focusout", _this.handlePasswordConfirmInputMouseEvent);
        };
        this.handlePasswordConfirmInputKeyEvent = function () {
            var passwordConfirmInputValue = _this.passwordConfirmInfoInput.value;
            if (passwordConfirmInputValue) {
                _this.passwordConfirmInfoMessage.textContent = "";
            }
        };
        this.handlePasswordConfirmInputMouseEvent = function () {
            var passwordConfirmInputValue = _this.passwordConfirmInfoInput.value;
            var passwordInputValue = _this.passwordInfoInput.value;
            _this.passwordConfirmInfoMessage.classList.add("member-info-error-text");
            _this.passwordConfirmInfoMessage.classList.remove("member-info-correct-text");
            try {
                (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validatePasswordConfirmInfo)(passwordConfirmInputValue, passwordInputValue);
            }
            catch (_a) {
                var message = _a.message;
                _this.passwordConfirmInfoMessage.textContent = "".concat(message);
                return;
            }
            _this.passwordConfirmInfoMessage.textContent = "비밀번호가 일치합니다!";
            _this.passwordConfirmInfoMessage.classList.remove("member-info-error-text");
            _this.passwordConfirmInfoMessage.classList.add("member-info-correct-text");
        };
        this.handlePasswordInputKeyEvent = function () {
            var passwordInputValue = _this.passwordInfoInput.value;
            if (passwordInputValue) {
                _this.passwordInfoMessage.textContent = "";
            }
        };
        this.handlePasswordInputMouseEvent = function () {
            var passwordInputValue = _this.passwordInfoInput.value;
            _this.passwordInfoMessage.classList.add("member-info-error-text");
            _this.passwordInfoMessage.classList.remove("member-info-correct-text");
            try {
                (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validatePasswordInfo)(passwordInputValue);
            }
            catch (_a) {
                var message = _a.message;
                _this.passwordInfoMessage.textContent = "".concat(message);
                return;
            }
            if (passwordInputValue.length >= 8) {
                _this.passwordInfoMessage.textContent = "안전한 비밀번호네요!";
            }
            if (passwordInputValue.length >= 12) {
                _this.passwordInfoMessage.textContent = "매우 안전한 비밀번호네요!";
            }
            _this.passwordInfoMessage.classList.remove("member-info-error-text");
            _this.passwordInfoMessage.classList.add("member-info-correct-text");
        };
        this.handleNameInputKeyEvent = function () {
            var nameInputValue = _this.nameInfoInput.value;
            if (nameInputValue) {
                _this.nameInfoMessage.textContent = "";
            }
        };
        this.handleNameInputMouseEvent = function () {
            var nameInputValue = _this.nameInfoInput.value;
            _this.nameInfoMessage.classList.add("member-info-error-text");
            _this.nameInfoMessage.classList.remove("member-info-correct-text");
            try {
                (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateNameInfo)(nameInputValue);
            }
            catch (_a) {
                var message = _a.message;
                _this.nameInfoMessage.textContent = "".concat(message);
                return;
            }
            _this.nameInfoMessage.textContent = "멋진 이름이네요!";
            _this.nameInfoMessage.classList.remove("member-info-error-text");
            _this.nameInfoMessage.classList.add("member-info-correct-text");
        };
        this.handleEmailInputKeyEvent = function () {
            var emailInputValue = _this.emailInfoInput.value;
            if (emailInputValue) {
                _this.emailInfoMessage.textContent = "";
            }
        };
        this.handleEmailInputMouseEvent = function () {
            var emailInputValue = _this.emailInfoInput.value;
            _this.emailInfoMessage.classList.add("member-info-error-text");
            _this.emailInfoMessage.classList.remove("member-info-correct-text");
            try {
                (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateEmailInfo)(emailInputValue);
            }
            catch (_a) {
                var message = _a.message;
                _this.emailInfoMessage.textContent = "".concat(message);
                return;
            }
            _this.emailInfoMessage.textContent = "멋진 이메일이네요!";
            _this.emailInfoMessage.classList.remove("member-info-error-text");
            _this.emailInfoMessage.classList.add("member-info-correct-text");
        };
        this.handleSubmitSignup = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var emailInputValueResult, nameInputValue, passwordInputValue, passwordConfirmInputValue, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        emailInputValueResult = this.emailInfoInput.value;
                        nameInputValue = this.nameInfoInput.value;
                        passwordInputValue = this.passwordInfoInput.value;
                        passwordConfirmInputValue = this.passwordConfirmInfoInput.value;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateEmailInfo)(emailInputValueResult);
                        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateNameInfo)(nameInputValue);
                        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validatePasswordInfo)(passwordInputValue);
                        (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validatePasswordConfirmInfo)(passwordConfirmInputValue, passwordInputValue);
                        return [4 /*yield*/, fetch("https://vendingdb.herokuapp.com/register", {
                                method: "POST",
                                body: JSON.stringify({
                                    email: emailInputValueResult,
                                    name: nameInputValue,
                                    password: passwordInputValue
                                }),
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        console.log(response);
                        if (response.status === 404) {
                            throw Error();
                            return [2 /*return*/];
                        }
                        history.pushState({ path: "#login" }, null, "#login");
                        this.convertTemplate("#login");
                        (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__.showSnackbar)("회원가입을 완료하였습니다.");
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        (0,_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_2__.showSnackbar)("모든 값을 입력해주세요.");
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.convertTemplate = convertTemplate;
        this.vendingmachineFunctionWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)(".main");
    }
    Signup.prototype.render = function () {
        this.vendingmachineFunctionWrap.replaceChildren();
        this.vendingmachineFunctionWrap.insertAdjacentHTML("beforeend", _signupTemplate__WEBPACK_IMPORTED_MODULE_3__.signupTemplate);
        this.bindSignupDom();
    };
    return Signup;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Signup);


/***/ }),

/***/ "./src/ts/components/signup/signupTemplate.ts":
/*!****************************************************!*\
  !*** ./src/ts/components/signup/signupTemplate.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "signupTemplate": () => (/* binding */ signupTemplate)
/* harmony export */ });
var signupTemplate = "\n  <section id=\"signup-section\">\n    <h1 class=\"member-page-main-text\">\uD68C\uC6D0\uAC00\uC785</h1>\n    <form class=\"member-info-form\" id=\"signup-form\">\n      <label class=\"member-info-form-label\">\uC774\uBA54\uC77C</label>\n      <input class=\"member-info-input \" id=\"email-info-input\" placeholder=\"\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694\" type=\"text\" />\n      <p class=\"member-info-message member-info-error-text\" id=\"email-info-message\"></p>\n      <label class=\"member-info-form-label\">\uC774\uB984</label>\n      <input class=\"member-info-input\" id=\"name-info-input\" placeholder=\"\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694\" type=\"text\" minlength=\"1\" />\n      <p class=\"member-info-message member-info-error-text \" id=\"name-info-message\"></p>\n      <label class=\"member-info-form-label\">\uBE44\uBC00\uBC88\uD638</label>\n      <input class=\"member-info-input\" id=\"password-info-input\" placeholder=\"\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694\" type=\"password\" autocomplete=\"off\" minlength=\"8\" maxlength=\"16\" />\n      <p class=\"member-info-message member-info-error-text\" id=\"password-info-message\"></p>\n      <label class=\"member-info-form-label\">\uBE44\uBC00\uBC88\uD638 \uD655\uC778</label>\n      <input class=\"member-info-input\" id=\"password-confirm-info-input\" placeholder=\"\uBE44\uBC00\uBC88\uD638\uB97C \uB2E4\uC2DC \uC785\uB825\uD574\uC8FC\uC138\uC694\" type=\"password\" autocomplete=\"off\" minlength=\"8\" maxlength=\"16\" />\n      <p class=\"member-info-message member-info-error-text\" id=\"password-confirm-info-message\"></p>\n      <button class=\"member-confirm-button\" tpye=\"submit\">\uD655\uC778</button>\n    </form>\n  </section>\n";



/***/ }),

/***/ "./src/ts/components/snackbar/snackbar.ts":
/*!************************************************!*\
  !*** ./src/ts/components/snackbar/snackbar.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "showSnackbar": () => (/* binding */ showSnackbar)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/dom */ "./src/ts/utils/dom.ts");
/* harmony import */ var _snackbarTemplate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./snackbarTemplate */ "./src/ts/components/snackbar/snackbarTemplate.ts");


var showSnackbar = function (message) {
    var snackbarFragment = document.createElement("div");
    var snackbarWrap = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.selectDom)("#snackbar-wrap");
    snackbarFragment.insertAdjacentHTML("beforeend", (0,_snackbarTemplate__WEBPACK_IMPORTED_MODULE_1__.snackbarTemplate)(message));
    snackbarFragment.classList.add("snackbar-animation");
    snackbarWrap.insertAdjacentElement("beforeend", snackbarFragment);
    removeSnackbar(snackbarWrap);
};
var removeSnackbar = function (snackbarWrap) {
    var showSnackbarTime = new Date().getTime();
    var callback = function () {
        var currentTime = new Date().getTime();
        if (currentTime - 2000 > showSnackbarTime) {
            snackbarWrap.firstChild.remove();
        }
        else {
            requestAnimationFrame(callback);
        }
    };
    requestAnimationFrame(callback);
};



/***/ }),

/***/ "./src/ts/components/snackbar/snackbarTemplate.ts":
/*!********************************************************!*\
  !*** ./src/ts/components/snackbar/snackbarTemplate.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "snackbarTemplate": () => (/* binding */ snackbarTemplate),
/* harmony export */   "purchaseProductText": () => (/* binding */ purchaseProductText),
/* harmony export */   "insertMoneyText": () => (/* binding */ insertMoneyText),
/* harmony export */   "registerProductText": () => (/* binding */ registerProductText),
/* harmony export */   "deleteProductText": () => (/* binding */ deleteProductText),
/* harmony export */   "editProductInfoText": () => (/* binding */ editProductInfoText)
/* harmony export */ });
var snackbarTemplate = function (message) {
    return "\n    <div class=\"snackbar\">\n      <p class=\"snackbar-text\">".concat(message, "</p>\n    </div>\n  ");
};
var purchaseProductText = function (productName) {
    return "".concat(productName, " 1\uAC1C \uAD6C\uB9E4 \uC644\uB8CC\uD558\uC600\uC2B5\uB2C8\uB2E4.");
};
var insertMoneyText = function (insertMoney) {
    return "".concat(insertMoney, "\uC6D0 \uCDA9\uC804 \uC644\uB8CC\uD558\uC600\uC2B5\uB2C8\uB2E4.");
};
var registerProductText = function (_a) {
    var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
    return "".concat(productName, " ").concat(productPrice, "\uC6D0 ").concat(productQuantity, "\uAC1C \uB4F1\uB85D \uC644\uB8CC\uD558\uC600\uC2B5\uB2C8\uB2E4.");
};
var deleteProductText = function (productName) {
    return "".concat(productName, " \uC0AD\uC81C \uC644\uB8CC\uD558\uC600\uC2B5\uB2C8\uB2E4.");
};
var editProductInfoText = function (_a) {
    var productName = _a.productName, productPrice = _a.productPrice, productQuantity = _a.productQuantity;
    return "".concat(productName, " ").concat(productPrice, "\uC6D0 ").concat(productQuantity, "\uAC1C\uB85C \uC218\uC815 \uC644\uB8CC\uD558\uC600\uC2B5\uB2C8\uB2E4.");
};



/***/ }),

/***/ "./src/ts/utils/constants.ts":
/*!***********************************!*\
  !*** ./src/ts/utils/constants.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PRODUCT": () => (/* binding */ PRODUCT),
/* harmony export */   "CHARGE": () => (/* binding */ CHARGE),
/* harmony export */   "specialSymbolAsc": () => (/* binding */ specialSymbolAsc),
/* harmony export */   "upperCaseAsc": () => (/* binding */ upperCaseAsc),
/* harmony export */   "lowerCaseAsc": () => (/* binding */ lowerCaseAsc),
/* harmony export */   "numberAsc": () => (/* binding */ numberAsc)
/* harmony export */ });
var PRODUCT = {
    MIN_PRICE: 100,
    MAX_PRICE: 10000,
    UNIT: 10,
    MAX_LENGTH: 10,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 20
};
var CHARGE = {
    MIN_PRICE: 10,
    MAX_PRICE: 100000,
    UNIT: 10,
    RETURN_CHARGE_UNIT: 1000
};
var specialSymbolAsc = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126];
var upperCaseAsc = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90];
var lowerCaseAsc = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122];
var numberAsc = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];



/***/ }),

/***/ "./src/ts/utils/dom.ts":
/*!*****************************!*\
  !*** ./src/ts/utils/dom.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "selectDom": () => (/* binding */ selectDom),
/* harmony export */   "selectDomAll": () => (/* binding */ selectDomAll),
/* harmony export */   "addEvent": () => (/* binding */ addEvent)
/* harmony export */ });
/* harmony import */ var _components_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/snackbar/snackbar */ "./src/ts/components/snackbar/snackbar.ts");

var selectDom = function (selector, element) {
    if (element === void 0) { element = document; }
    return element.querySelector(selector);
};
var selectDomAll = function (selector, element) {
    if (element === void 0) { element = document; }
    return Array.from(element.querySelectorAll(selector));
};
var addEvent = function (target, eventName, handler) {
    target.addEventListener(eventName, function (event) {
        try {
            handler(event);
        }
        catch (_a) {
            var message = _a.message;
            (0,_components_snackbar_snackbar__WEBPACK_IMPORTED_MODULE_0__.showSnackbar)(message);
            return;
        }
    });
};



/***/ }),

/***/ "./src/ts/utils/validation.ts":
/*!************************************!*\
  !*** ./src/ts/utils/validation.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "validateProductName": () => (/* binding */ validateProductName),
/* harmony export */   "validateProductPrice": () => (/* binding */ validateProductPrice),
/* harmony export */   "valudateProductQuantity": () => (/* binding */ valudateProductQuantity),
/* harmony export */   "validateSameProductName": () => (/* binding */ validateSameProductName),
/* harmony export */   "validateCharge": () => (/* binding */ validateCharge),
/* harmony export */   "validatePossiblePurchaseProduct": () => (/* binding */ validatePossiblePurchaseProduct),
/* harmony export */   "validateEmailInfo": () => (/* binding */ validateEmailInfo),
/* harmony export */   "validateNameInfo": () => (/* binding */ validateNameInfo),
/* harmony export */   "validatePasswordInfo": () => (/* binding */ validatePasswordInfo),
/* harmony export */   "validatePasswordConfirmInfo": () => (/* binding */ validatePasswordConfirmInfo)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/ts/utils/constants.ts");

var validateProductName = function (productName) {
    if (productName.trim() === "") {
        throw new Error("상품명을 입력해주세요.");
    }
    if (productName.length > _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_LENGTH) {
        throw new Error("\uC0C1\uD488\uBA85\uC740 \uCD5C\uB300 ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_LENGTH, "\uAE00\uC790\uAE4C\uC9C0 \uC785\uB825 \uAC00\uB2A5\uD569\uB2C8\uB2E4."));
    }
};
var validateProductPrice = function (productPrice) {
    if (typeof productPrice !== "number") {
        throw new Error("값을 모두 입력해주세요.");
    }
    if (productPrice < _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MIN_PRICE || productPrice > _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_PRICE) {
        throw new Error("\uC0C1\uD488 \uAC00\uACA9\uC740 ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MIN_PRICE, "\uC6D0\uBD80\uD130, \uCD5C\uB300 ").concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_PRICE, "\uC6D0\uAE4C\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4."));
    }
    if (productPrice % _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.UNIT !== 0) {
        throw new Error("\uC0C1\uD488 \uAC00\uACA9\uC740 ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.UNIT, "\uC6D0\uC73C\uB85C \uB098\uB204\uC5B4 \uB5A8\uC5B4\uC838\uC57C\uD569\uB2C8\uB2E4."));
    }
};
var valudateProductQuantity = function (productQuantity) {
    if (productQuantity > _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_QUANTITY ||
        productQuantity < _constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MIN_QUANTITY) {
        throw new Error("\uC81C\uD488\uB2F9 \uC218\uB7C9\uC740 \uCD5C\uC18C ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MIN_QUANTITY, "\uAC1C\uBD80\uD130 \uCD5C\uB300 ").concat(_constants__WEBPACK_IMPORTED_MODULE_0__.PRODUCT.MAX_QUANTITY, "\uAC1C\uAE4C\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4."));
    }
    if (productQuantity - Math.floor(productQuantity)) {
        throw new Error("제품의 수량은 소수점으로 입력할 수 없습니다.");
    }
};
var validateSameProductName = function (productName, productNameList) {
    if (productNameList.includes(productName)) {
        throw new Error("같은 이름의 제품은 등록할 수 없습니다.");
    }
};
var validateCharge = function (charge) {
    if (charge < _constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.MIN_PRICE || charge > _constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.MAX_PRICE) {
        throw new Error("\uCD5C\uC18C ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.MIN_PRICE, "\uC6D0, \uCD5C\uB300 ").concat(_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.MAX_PRICE, "\uC6D0\uAE4C\uC9C0 \uD22C\uC785\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."));
    }
    if (charge % _constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.UNIT !== 0) {
        throw new Error("\uC794\uB3C8\uC740 ".concat(_constants__WEBPACK_IMPORTED_MODULE_0__.CHARGE.UNIT, "\uC6D0\uC73C\uB85C \uB098\uB204\uC5B4 \uB5A8\uC5B4\uC9C0\uB294 \uAE08\uC561\uB9CC \uD22C\uC785\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."));
    }
    if (!charge) {
        throw new Error("금액을 입력해주세요.");
    }
};
var validatePossiblePurchaseProduct = function (_a) {
    var totalMoney = _a.totalMoney, productPrice = _a.productPrice;
    if (totalMoney < productPrice) {
        throw new Error("보유한 금액이 부족합니다. 구매를 원하시면 금액을 더 투입해주세요.");
    }
};
var validateEmailInfo = function (emailInputValue) {
    var emailInfoSplit = emailInputValue.split("");
    var emailInfoSplitAt = emailInputValue.split("@");
    if (!emailInputValue) {
        throw Error("필수 정보입니다.");
    }
    if (!emailInfoSplit.includes("@")) {
        throw Error("이메일 입력값에는 @가 필수입니다.");
    }
    if (emailInfoSplit.filter(function (text) { return text === "@"; }).length > 1) {
        throw Error("@ 다음 부분에 @기호를 포함할 수 없습니다.");
    }
    if (emailInfoSplitAt[0].length === 0) {
        throw Error("@ 앞부분을 입력해주세요.");
    }
    if (emailInfoSplitAt[1].length < 1) {
        throw Error("@ 뒷부분을 입력해주세요.");
    }
    if (emailInfoSplit.find(function (text) { return text === " "; })) {
        throw Error("이메일에 공백을 포함할 수 없습니다.");
    }
};
var validateNameInfo = function (nameInputValue) {
    if (!nameInputValue) {
        throw Error("필수 정보입니다.");
    }
    if (nameInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.specialSymbolAsc.includes(nameInputValue.charCodeAt(index)); })) {
        throw Error("한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)");
    }
    if (nameInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.numberAsc.includes(nameInputValue.charCodeAt(index)); })) {
        throw Error("한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)");
    }
    if (nameInputValue.split("").find(function (text) { return text === " "; })) {
        throw Error("한글과 영문을 입력해주세요. (특수기호, 숫자, 공백 사용 불가)");
    }
};
var validatePasswordInfo = function (passwordInputValue) {
    if (!passwordInputValue) {
        throw Error("필수 정보입니다.");
    }
    if (passwordInputValue.split("").find(function (text) { return text === " "; })) {
        throw Error("비밀번호에 공백을 포함할 수 없습니다.");
    }
    if (!passwordInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.specialSymbolAsc.includes(passwordInputValue.charCodeAt(index)); })) {
        throw Error("8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.");
    }
    if (!passwordInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.upperCaseAsc.includes(passwordInputValue.charCodeAt(index)); })) {
        throw Error("8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.");
    }
    if (!passwordInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.lowerCaseAsc.includes(passwordInputValue.charCodeAt(index)); })) {
        throw Error("8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.");
    }
    if (!passwordInputValue.split("").find(function (_, index) { return _constants__WEBPACK_IMPORTED_MODULE_0__.numberAsc.includes(passwordInputValue.charCodeAt(index)); })) {
        throw Error("8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.");
    }
};
var validatePasswordConfirmInfo = function (passwordConfirmInputValue, passwordInputValue) {
    if (!passwordConfirmInputValue) {
        throw Error("필수 정보입니다.");
    }
    if (passwordInputValue !== passwordConfirmInputValue) {
        throw Error("비밀번호가 일치하지 않습니다.");
    }
};



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css/index.css */ "./src/css/index.css");
/* harmony import */ var _ts_components_Vendingmachine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ts/components/Vendingmachine */ "./src/ts/components/Vendingmachine.ts");


document.addEventListener("DOMContentLoaded", function () { return new _ts_components_Vendingmachine__WEBPACK_IMPORTED_MODULE_1__["default"](); });

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map