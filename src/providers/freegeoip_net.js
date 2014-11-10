// freegeoip_net.js

GeoLoc.providers['freegeoip_net'] = {
	getPosition: function(cb, options) {
		return jsonpRequest.send(
			'http://freegeoip.net/json/',
			options && { timeout: options.timeout },
			function(err, data) {
				cb(err, data && {
					latitude: data.latitude,
					longitude: data.longitude
				});
			}
		);
	}
};
