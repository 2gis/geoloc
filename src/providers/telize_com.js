// telize_com.js

GeoLoc.providers['telize_com'] = {
	getPosition: function(cb, options) {
		jsonpRequest.send('http://www.telize.com/geoip/', options && { timeout: options.timeout }, function(err, data) {
			cb(err, data && {
				latitude: data.latitude,
				longitude: data.longitude
			});
		});
	}
};
