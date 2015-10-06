var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  connect = require('gulp-connect'),
  notify = require("gulp-notify"),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  del = require('del');

gulp.task('dist', function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('d3-flame-graph.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Build complete.' }));
});

gulp.task('clean', function() {
    del(['dist'])
});

gulp.task('connect', function() {
  connect.server({
    root: ['example', 'src', 'bower_components'],
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./example/*.html')
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src('./src/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./example/*.html'], ['html']);
  gulp.watch(['./src/*.js'], ['js']);
});

gulp.task('default', ['connect', 'watch']);
