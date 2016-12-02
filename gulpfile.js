var gulp = require('gulp');
var run = require('gulp-run');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require("vinyl-buffer");
var browserSync = require('browser-sync').create();
var del = require('del');
var runSequence = require("run-sequence");
var rollup = require('rollup-stream');
var rollupNodeResolve = require('rollup-plugin-node-resolve');
var rollupCommonjs = require('rollup-plugin-commonjs');
var rollupSourcemaps = require('rollup-plugin-sourcemaps');
var rollupTypescript = require('rollup-plugin-typescript');
var rollupUglify = require('rollup-plugin-uglify');

// use tsconfig as authoritative location for source and output locations
var tsconfig = require('./tsconfig.json');
var rootDir = tsconfig.compilerOptions.rootDir;
var outDir = tsconfig.compilerOptions.outDir;

gulp.task("copy-html", function () {
    return gulp.src(rootDir + '/**/*.html')
        .pipe(gulp.dest(outDir));
});

gulp.task("copy-styles", function () {
    return gulp.src(rootDir + '/**/*.css')
        .pipe(gulp.dest(outDir));
});

gulp.task('tsc', function (cb) {
    // run tsc directly for
    // 1. error messages that vscode tsc problem matcher understands
    // 2. sourcemaps for debugging in Chrome from vscode
    // Note: gulp-typescript produces error messages in the correct format,
    // but it requires gulp-sourcemaps which doesn't get sourcemap path right
    // for parallel output directory
    run('tsc').exec(cb)
        .on('error', console.error.bind(console))
});

gulp.task('dev-rollup', ['tsc'], function () {
    // Pickup transpiled js files and sourcemaps from dev-tsc task
    // Don't use rollup-typescript-plugin here because it doesn't report both syntax and symantic errors
    return rollup({
        entry: outDir + '/index.js',
        sourceMap: true,
        format: 'iife',
        plugins: [
            rollupSourcemaps(),
            rollupNodeResolve({
                jsnext: true,
                main: true,
                browser: true
            }),
            rollupCommonjs()
        ]
    })
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js', outDir))
        .pipe(buffer())
        // gulp-sourcemaps is needed here because gulp-rollup suppresses direct tsc sourcemap output
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(outDir));
});

gulp.task('prod-rollup', function () {
    // use rollup-plugin-typescript for prod build
    // its not used for dev builds because it doesn't surface tsc errors
    return rollup({
        entry: 'src/index.ts',
        format: 'iife',
        plugins: [
            rollupTypescript({
                typescript: require('typescript')
            }),
            rollupSourcemaps(),
            rollupNodeResolve({
                jsnext: true,
                main: true,
                browser: true
            }),
            rollupCommonjs()
        ]
    })
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js', './dist'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('dev-build', function (cb) {
    // run in sequence
    // clean needs to be run first
    // copy and tsc really should be able to run in parallel, but result in directory creation conflicts
    runSequence('clean', 'copy-html', 'copy-styles', 'dev-rollup', cb);
});

gulp.task('prod-build', function (cb) {
    // run in sequence
    // clean needs to be run first
    // copy and tsc really should be able to run in parallel, but result in directory creation conflicts
    runSequence('clean', 'copy-html', 'copy-styles', 'prod-rollup', cb);
});

gulp.task('watch', ['serve'], function (cb) {
    gulp.watch(rootDir + '/**/*.ts', ['dev-bundle', 'reload']);
    gulp.watch(rootDir + '/**/*.html', ['copy-html', 'reload']);
    gulp.watch(rootDir + '/**/*.css', ['copy-styles', 'reload']);
});

gulp.task('reload', function () {
    browserSync.reload();
});

gulp.task('serve', ['dev-build'], function (done) {
    browserSync.init({
        // don't require online connectivity
        online: false,
        // don't open a browser
        open: false,
        port: 44301,
        https: true,
        server: {
            baseDir: [outDir]
        }
    }, done);
});

gulp.task('clean', function () {
    return del(outDir);
});
