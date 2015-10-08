var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  notify = require("gulp-notify"),
  rename = require('gulp-rename'),
  jshint = require('gulp-jshint'),
  del = require('del'),
  browserSync = require('browser-sync').create();

gulp.task('clean', function() {
  del(['dist'])
});

gulp.task('dist', ['lint'], function() {
  return gulp.src('./src/**/*.js')
    .pipe(concat('d3.flame.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Build complete.' }));
});

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ['example', 'src', 'bower_components']
        }
    });
});

gulp.task('default', ['browser-sync']);
