
var argv = require('yargs').argv;
var express = require('express');
var notifier = require('node-notifier');

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');

var uglify = require('gulp-uglify');
var jscs = require('gulp-jscs');

var mainScripts = [
	'bower_components/jsonp-request/jsonpRequest.js',

	'src/_head.js',
	'src/GeoLoc.js',
	'src/providers/freegeoip_net.js',
	'src/providers/telize_com.js',
	'src/providers/html5geolocation.js',
	'src/_tail.js'
];

function plumberErrorHandler(err) {
	gutil.log(err.toString(), '\n' + gutil.colors.red('--------'));
	notifier.notify({ title: err.name, message: err.message });
}

gulp.task('geoloc-main', function() {
	gulp.src(mainScripts)
		.pipe(plumber(plumberErrorHandler))
		.pipe(concat('GeoLoc.js'))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'));
});

gulp.task('server', function() {
	var server = express();

	server.use(express.static('dist'));

	server.get('/', function(req, res) {
		res.sendFile('index.html',  { root: '.' });
	});

	server.listen(8020, function() {
		console.log('Listening on port %d', 8020);
	});
});

gulp.task('default', ['geoloc-main'], function() {
	if (argv.dev) {
		gulp.watch(mainScripts, ['geoloc-main']);
		gulp.start('server');
	}
});

gulp.task('lint', function() {
	return gulp.src(mainScripts.slice(2, -1))
		.pipe(jscs());
});
