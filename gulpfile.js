
// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    //autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    del = require('del'),
    htmlmin = require('gulp-htmlmin'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    nunjucksRenderer = require('gulp-nunjucks-render'),
    browserSync = require('browser-sync').create();

nunjucksRenderer.nunjucks.configure( ['./src/views/'] );

var buildPath = 'src';
var targetPath = 'dist';

// error handling
function handleError(err) {
    console.log('ERROR HANDLER: ', err.toString());
    this.emit('end');
}

//Styles
gulp.task('styles:build', function () {
    return gulp.src(buildPath + '/sass/*.scss')

        .pipe(sass().on('error', sass.logError))
        .on('error', handleError)

        // .pipe(autoprefixer({
        //     browserslist: [
        //         'last 2 version',
        //         'BlackBerry'
        //     ]
        // }))
        // .on('error', handleError)

        .pipe(cssnano({
            reduceIdents: false
        }))
        .on('error', handleError)

        .pipe(gulp.dest(targetPath + '/css'))
        .on('error', handleError)

        .pipe(notify({message: 'Styles Build task complete'}))
        .on('error', handleError);
});

gulp.task('styles:dev', function () {
    return gulp.src(buildPath + '/sass/*.scss')

        .pipe(sourcemaps.init())
        .on('error', handleError)

        .pipe(sass().on('error', sass.logError))
        .on('error', handleError)

        // .pipe(autoprefixer('last 2 version'))
        // .on('error', handleError)

        .pipe(sourcemaps.write('.'))
        .on('error', handleError)

        .pipe(gulp.dest(targetPath  + '/css'))
        .on('error', handleError)

        .pipe(notify({message: 'Styles task complete'}))
        .on('error', handleError)

        .pipe(browserSync.stream({match: '**/*.css'}));
});

// Scripts
gulp.task('scripts:build', function () {
    return gulp.src([
        `!${buildPath}/js/vendor/*.js`,
        buildPath + '/js/*/**/*.js',
        buildPath + '/js/*.js',
    ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', handleError)

        .pipe(concat('app.js'))
        .on('error', handleError)

        .pipe(uglify())
        .on('error', handleError)

        .pipe(gulp.dest(targetPath + '/js'))
        .on('error', handleError)

        .pipe(notify({message: 'Scripts Build task complete'}))
        .on('error', handleError);
});
gulp.task('scripts:dev', function () {
    return gulp.src([
        `!${buildPath}/js/vendor/*.js`,
        buildPath + '/js/*/**/*.js',
        buildPath + '/js/*.js',
    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', handleError)

        .pipe(concat('app.js'))
        .on('error', handleError)

        .pipe(sourcemaps.write('.'))
        .on('error', handleError)

        .pipe(gulp.dest(targetPath + '/js'))
        .on('error', handleError)

        .pipe(notify({message: 'Scripts task complete'}))
        .on('error', handleError)

        .pipe(browserSync.stream());
});
gulp.task('scripts:vendor', function () {
    return gulp.src([
        buildPath + '/js/vendor/*.js'
    ])
        .pipe(concat('vendor.js'))
        .on('error', handleError)

        .pipe(uglify())
        .on('error', handleError)

        .pipe(gulp.dest(targetPath + '/js'))
        .on('error', handleError)

        .pipe(notify({message: 'Scripts Vendor Build task complete'}))
        .on('error', handleError);
});

// Images
gulp.task('images', function () {
    return gulp.src(buildPath + '/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .on('error', handleError)

        .pipe(gulp.dest(targetPath + '/images'))
        .on('error', handleError);
});

// HTML
gulp.task('html:build', function () {
    return gulp.src(buildPath + '/*.html')
    /*.pipe(htmlmin({
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        preserveLineBreaks: true,
    }))*/
        .on('error', handleError)

        //.pipe(rename('index.html'))
        .on('error', handleError)

        .pipe(gulp.dest(targetPath))
        .on('error', handleError);
});
gulp.task('html:dev', function () {
    return gulp.src(buildPath + '/*.html')
    //.pipe(rename('index.html'))
        .on('error', handleError)
        .pipe(gulp.dest(targetPath))
        .on('error', handleError)
        .pipe(browserSync.stream());
});

gulp.task('nunjucks:build', function () {
    return gulp.src(buildPath + '/views/*.html')
        .pipe(nunjucksRenderer({
            path: buildPath + '/views/'
        }))
        .on('error', handleError)
        .pipe(gulp.dest(targetPath))
        .on('error', handleError)
});

gulp.task('nunjucks:dev', function () {
    return gulp.src(buildPath + '/views/*.html')
        .pipe(nunjucksRenderer({
            path: buildPath + '/views/'
        }))
        .on('error', handleError)
        .pipe(gulp.dest(targetPath))
        .on('error', handleError)
        .pipe(browserSync.stream());
});

gulp.task('nunjucks-overlays:build', function () {
    return gulp.src(buildPath + '/views/overlays/*.html')
        .pipe(nunjucksRenderer({
            path: buildPath + '/views/'
        }))
        .on('error', handleError)
        .pipe(gulp.dest(targetPath + '/overlays/'))
        .on('error', handleError)
});

gulp.task('nunjucks-overlays:dev', function () {
    return gulp.src(buildPath + '/views/overlays/*.html')
        .pipe(nunjucksRenderer({
            path: buildPath + '/views/'
        }))
        .on('error', handleError)
        .pipe(gulp.dest(targetPath + '/overlays/'))
        .on('error', handleError)
        .pipe(browserSync.stream());
});

// Other Assets
gulp.task('assets', function () {
    return gulp.src(buildPath + '/assets/**/*')
        .pipe(gulp.dest(targetPath));
});

// Clean
gulp.task('clean', function () {
    return del([targetPath]);
});

// Default task
gulp.task('default', 
    gulp.series('styles:dev', 'scripts:vendor', 'scripts:dev', 'images', 'nunjucks:dev', 'nunjucks-overlays:dev', 'assets')
);

gulp.task('build',
    gulp.series('clean', 'styles:build', 'scripts:vendor', 'scripts:build', 'images', 'nunjucks:build', 'nunjucks-overlays:build', 'assets')
);

// Watch
gulp.task('watch', function () {

    console.log('--- ## --- Let\'s get ready to create something awesome! --- ## ---');

    browserSync.init({
        server: "./" + targetPath,
        port: 3030
    });

    // Watch .less files
    gulp.watch(buildPath + '/sass/**/*.scss').on('change', gulp.series('styles:dev'));

    // Watch .js files
    gulp.watch(buildPath + '/js/**/*.js').on('change', gulp.series('scripts:dev'));

    // Watch image files
    gulp.watch(buildPath + '/images/**/*').on('change', gulp.series('images'));

    // Watch html files
    gulp.watch(buildPath + '/**/*.html').on('change', gulp.series('nunjucks:dev', 'nunjucks-overlays:dev'));
});
