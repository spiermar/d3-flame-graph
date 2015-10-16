var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  notify = require("gulp-notify"),
  rename = require('gulp-rename'),
  jshint = require('gulp-jshint'),
  minifycss = require('gulp-minify-css'),
  del = require('del'),
  browserSync = require('browser-sync').create();

gulp.task('clean', function() {
  del(['dist'])
});

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('d3.flameGraph.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Scripts task complete.' }));
});

gulp.task('styles', function() {
  return gulp.src('src/**/*.css', { style: 'expanded' })
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('dist', ['clean', 'scripts', 'styles']);

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ['example', 'src', 'bower_components']
        }
    });
});

gulp.task('default', ['browser-sync']);
