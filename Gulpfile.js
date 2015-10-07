var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  connect = require('gulp-connect'),
  notify = require("gulp-notify"),
  rename = require('gulp-rename'),
  del = require('del'),
  browserSync = require('browser-sync').create();

gulp.task('clean', function() {
  del(['dist'])
});

gulp.task('dist', function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('d3.layout.flame.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Build complete.' }));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ['example', 'src', 'bower_components']
        }
    });
});

gulp.task('default', ['browser-sync']);
