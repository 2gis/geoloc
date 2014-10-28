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
