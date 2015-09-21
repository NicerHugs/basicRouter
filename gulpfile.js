'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('hi', function() {
  console.log('hi');
});

gulp.task('serve', function() {
  connect.server({
    port: 9000
  });
});
