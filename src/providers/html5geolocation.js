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
