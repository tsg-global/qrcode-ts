'use strict';

const typescript = require('gulp-typescript');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const grename = require('gulp-rename');

gulp.task('build', function() {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript({
			"module": "commonjs",
			"target": "es3",
			"noImplicitAny": false,
			"sourceMap": true
		}))
		.pipe(gulp.dest('./lib'));
});

gulp.task('js', ['build'], function() {
  // set up the browserify instance on a task basis
  var b = browserify({
	paths: ['lib'],
	entries: './lib/qrcode.js',
	debug: true
  });

  return b.bundle()
	.pipe(source('qrcode.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist/js/'));
});

gulp.task('minify', ['js'], function() {
	return gulp.src('./dist/js/qrcode.js')
		.pipe(uglify().on('error', gutil.log))
		.pipe(grename({ suffix: '.min' }))
		.pipe(gulp.dest('./dist/js/'))
});

gulp.task('default', ['build', 'js', 'minify']);
