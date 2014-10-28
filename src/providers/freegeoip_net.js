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
