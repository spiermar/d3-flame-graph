var gulp = require('gulp')
var rollup = require('rollup')
var uglify = require('gulp-uglify-es').default
var del = require('del')
var rename = require('gulp-rename')
var eslint = require('gulp-eslint')
var browserSync = require('browser-sync').create()
var resolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')

const rollupGlobals = {
    d3: 'd3'
}

const rollupInputOptions = {
    input: './src/flamegraph.js',
    external: Object.keys(rollupGlobals),
    plugins: [
        resolve({
            mainFields: ['module', 'main', 'jsnext:main'],
            browser: false,
            extensions: ['.js'],
            preferBuiltins: true,
            jail: '/',
            only: [
                'd3-collection',
                'd3-selection',
                'd3-format',
                'd3-array',
                'd3-hierarchy',
                'd3-scale',
                'd3-ease',
                'd3-interpolate',
                'd3-time',
                'd3-time-format',
                'd3-color',
                'd3-transition',
                'd3-dispatch',
                'd3-timer'
            ],
            modulesOnly: false
        }),
        commonjs()
    ]
}

const rollupOutputOptions = {
    name: 'd3.flamegraph',
    format: 'umd',
    extend: true,
    sourcemap: false,
    globals: rollupGlobals,
    file: './dist/d3-flamegraph.js'
}

gulp.task('clean', function () {
    return del(['dist'])
})

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
})

gulp.task('rollup:main', () => {
    return rollup.rollup(rollupInputOptions)
        .then(bundle => {
            return bundle.write(rollupOutputOptions)
        })
})

gulp.task('rollup:colorMapper', () => {
    return rollup.rollup({
        input: './src/colorMapper.js'
    })
        .then(bundle => {
            return bundle.write({
                file: './dist/d3-flamegraph-colorMapper.js',
                sourcemap: false,
                format: 'umd',
                name: 'd3.flamegraph.colorMapper'
            })
        })
})

gulp.task('rollup:flamegraphTooltip', () => {
    return rollup.rollup({
        input: './src/flamegraphTooltip.js',
        external: Object.keys(rollupGlobals),
        plugins: [
            resolve({
                mainFields: ['module', 'main', 'jsnext:main'],
                browser: false,
                extensions: ['.js'],
                preferBuiltins: true,
                jail: '/',
                only: [
                    'd3-selection',
                    'd3-transition'
                ],
                modulesOnly: false
            }),
            commonjs()
        ]
    })
        .then(bundle => {
            return bundle.write({
                file: './dist/d3-flamegraph-tooltip.js',
                sourcemap: false,
                format: 'umd',
                name: 'd3.flamegraph.tooltip'
            })
        })
})

gulp.task('uglify:main', function () {
    return gulp.src('./dist/d3-flamegraph.js')
        .pipe(gulp.dest('./dist'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
})

gulp.task('uglify:colorMapper', function () {
    return gulp.src('./dist/d3-flamegraph-colorMapper.js')
        .pipe(gulp.dest('./dist'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
})

gulp.task('uglify:flamegraphTooltip', function () {
    return gulp.src('./dist/d3-flamegraph-tooltip.js')
        .pipe(gulp.dest('./dist'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
})

gulp.task('style', function () {
    return gulp.src('./src/flamegraph.css')
        .pipe(rename('d3-flamegraph.css'))
        .pipe(gulp.dest('./dist'))
})

gulp.task('rollup-watch', gulp.series('rollup:main', 'rollup:colorMapper', 'rollup:flamegraphTooltip', function (done) {
    browserSync.reload()
    done()
}))

gulp.task('style-watch', gulp.series('style', function (done) {
    browserSync.reload()
    done()
}))

gulp.task('serve', gulp.series('lint', 'rollup:main', 'rollup:colorMapper', 'rollup:flamegraphTooltip', 'style', function () {
    browserSync.init({
        server: {
            baseDir: ['examples', 'dist']
        }
    })
    gulp.watch('./src/*.js', gulp.series('rollup-watch'))
    gulp.watch('./src/*.css', gulp.series('style-watch'))
}))

gulp.task('build', gulp.series('clean', 'lint', 'rollup:main', 'rollup:colorMapper', 'rollup:flamegraphTooltip', 'style', 'uglify:main', 'uglify:colorMapper', 'uglify:flamegraphTooltip'))

gulp.task('default', gulp.series('serve'))
