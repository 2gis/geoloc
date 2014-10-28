
(function(undefined) {

	var callbackIdCounter = 0;

	/**
	 * @param {string} url
	 * @param {Object} [[options]]
	 * @param {string} [options.callbackKey='callback']
	 * @param {string} [options.callbackName]
	 * @param {boolean} [options.preventCaching=true]
	 * @param {boolean} [options.cachingPreventionKey='noCache']
	 * @param {int} [options.timeout=120000]
	 * @param {Function} cb
	 * @returns {{ abort:Function; }}
	 */
	function send(url, options, cb) {
		if (!cb) {
			cb = options;
			options = {};
		} else if (!options) {
			options = {};
		}

		var callbackKey = options.callbackKey || 'callback';
		var callbackName = options.callbackName || '__callback' + (++callbackIdCounter);
		var preventCaching = options.preventCaching !== false;
		var cachingPreventionKey = options.cachingPreventionKey || 'noCache';
		var timeout = options.timeout || 120000;

		var script = document.createElement('script');

		script.src = url + (url.indexOf('?') == -1 ? '?' : '&') + callbackKey + '=' + callbackName +
			(preventCaching ? '&' + cachingPreventionKey + '=' + Math.random() : '');

		script.async = true;

		script.onerror = function() {
			dispose();
			cb(new Error('Script error'), null);
		};

		var timerId = setTimeout(function() {
			dispose();
			cb(new Error('Timeout error'), null);
		}, timeout);

		window[callbackName] = function(data) {
			dispose();
			cb(null, data);
		};

		var disposed = false;

		function dispose() {
			disposed = true;

			script.onerror = null;
			clearTimeout(timerId);
			delete window[callbackName];
			script.parentNode.removeChild(script);
		}

		(document.head || document.documentElement).appendChild(script);

		return {
			abort: function() {
				if (!disposed) {
					dispose();
					cb(new Error('Aborted'), null);
				}
			}
		};
	}

	window.jsonpRequest = {
		send: send
	};

})();

// GeoLoc.js
/**
 * @example
 * // Get with the default providers
 * GeoLoc
 *     .getPosition(function(err, pos) {
 *         console.log(pos);
 *     });
 *
 * @example
 * // Use provider
 * GeoLoc
 *     .use([GeoLoc.providers['html5geolocation']])
 *     .getPosition(function(err, pos) {
 *         console.log(pos);
 *     });
 */

(function() {

	var defaultProviders = [];

	/**
	 * @constructor
	 *
	 * @param {Object} [options]
	 * @param {int} [maximumAge=1000*60*60*24]
	 * @param {Array<GeoLoc.Provider>} [options.providers]
	 */
	function GeoLoc(options) {
		if (!options) {
			options = {};
		}

		if (options.maximumAge) {
			this.maximumAge = options.maximumAge;
		}

		this.providers = options.providers || defaultProviders;
	}

	/**
	 * @type {Object<GeoLoc.Provider>}
	 */
	GeoLoc.providers = {};

	/**
	 * @param {Array<GeoLoc.Provider>} providers
	 * @returns {Function}
	 */
	GeoLoc.setDefaultProviders = function(providers) {
		defaultProviders = providers;
		return GeoLoc;
	};

	/**
	 * @param {Array<GeoLoc.Provider>} providers
	 * @returns {GeoLoc}
	 */
	GeoLoc.use = function(providers) {
		return new GeoLoc({ providers: providers });
	};

	/**
	 * @param {Function} cb
	 * @param {Object} [options]
	 * @returns {GeoLoc}
	 */
	GeoLoc.getPosition = function(cb, options) {
		return new GeoLoc(options).getPosition(cb);
	};

	GeoLoc.prototype = {
		constructor: GeoLoc,

		maximumAge: 1000 * 60 * 60 * 24,

		providers: null,

		/**
		 * @param {Array<GeoLoc.Provider>} providers
		 * @returns {GeoLoc}
		 */
		use: function(providers) {
			this.providers = providers;
			return this;
		},

		/**
		 * @param {Function} cb
		 * @returns {GeoLoc}
		 */
		getPosition: function(cb) {
			var storedData = localStorage.getItem('_GeoLocData');

			if (storedData) {
				storedData = storedData.split(',');

				var timeStamp = Number(storedData[2]);

				if (Date.now() - timeStamp <= this.maximumAge) {
					cb(null, {
						latitude: Number(storedData[0]),
						longitude: Number(storedData[1])
					});

					return this;
				}
			}

			(function getPosition(providers) {
				var provider = providers.shift();

				provider.getPosition(function(err, data) {
					if (err) {
						if (providers.length) {
							getPosition(providers);
						} else {
							cb(err, null);
						}
					} else {
						if (typeof data.latitude != 'number' || typeof data.longitude != 'number') {
							if (providers.length) {
								getPosition(providers);
							} else {
								cb(new TypeError('Incorrect data'), null);
							}
						} else {
							localStorage.setItem('_GeoLocData', [
								data.latitude,
								data.longitude,
								Date.now()
							].join(','));

							cb(null, data);
						}
					}
				});
			})(this.providers.slice(0));

			return this;
		}
	};

	window.GeoLoc = GeoLoc;

})();

// freegeoip_net.js

GeoLoc.providers['freegeoip_net'] = {
	getPosition: function(cb) {
		jsonpRequest.send('http://freegeoip.net/json/', function(err, data) {
			cb(err, data && {
				latitude: data.latitude,
				longitude: data.longitude
			});
		});
	}
};

// telize_com.js

GeoLoc.providers['telize_com'] = {
	getPosition: function(cb) {
		jsonpRequest.send('http://www.telize.com/geoip/', function(err, data) {
			cb(err, data && {
				latitude: data.latitude,
				longitude: data.longitude
			});
		});
	}
};

// html5geolocation.js

GeoLoc.providers['html5geolocation'] = {
	getPosition: function(cb) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(pos) {
					cb(null, {
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude
					});
				},
				function(err) {
					cb(err, null);
				}
			);
		} else {
			cb(new TypeError('HTML5 Geolocation not supported'), null);
		}
	}
};

// _tail.js

GeoLoc.setDefaultProviders([
	GeoLoc.providers['freegeoip_net'],
	GeoLoc.providers['telize_com'],
	GeoLoc.providers['html5geolocation']
]);
