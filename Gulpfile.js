var gulp = require('gulp')
var rollup = require('rollup-stream')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify-es').default
var del = require('del')
var rename = require('gulp-rename')
var eslint = require('gulp-eslint')
var browserSync = require('browser-sync').create()

gulp.task('clean', function () {
  return del(['dist'])
})

gulp.task('lint', function () {
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('rollup', function () {
  return rollup('rollup.config.js')
    .pipe(source('d3-flamegraph.js'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('uglify', function () {
  return gulp.src('./dist/d3-flamegraph.js')
    .pipe(gulp.dest('./dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
})

gulp.task('style', function () {
  return gulp.src('./src/flamegraph.css')
    .pipe(rename('d3-flamegraph.css'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('rollup-watch', gulp.series('rollup', function (done) {
  browserSync.reload()
  done()
}))

gulp.task('style-watch', gulp.series('style', function (done) {
  browserSync.reload()
  done()
}))

gulp.task('serve', gulp.series('lint', 'rollup', 'style', function () {
  browserSync.init({
    server: {
      baseDir: ['examples', 'dist']
    }
  })
  gulp.watch('./src/*.js', gulp.series('rollup-watch'))
  gulp.watch('./src/*.css', gulp.series('style-watch'))
}))

gulp.task('build', gulp.series('clean', 'lint', 'rollup', 'style', 'uglify'))

gulp.task('default', gulp.series('serve'))
