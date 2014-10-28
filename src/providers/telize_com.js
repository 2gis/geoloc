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
