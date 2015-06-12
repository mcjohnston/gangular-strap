var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var plugins = require('gulp-load-plugins')();
var minifyCSS = require('gulp-minify-css');
var connect = require('gulp-connect');
var order = require('gulp-order');

// server setup
gulp.task('server', function () {
  connect.server({
    root: '',
    livereload: true
  });
});

// ------------------------------
// Vendor Tasks
// ------------------------------
gulp.task('vendor:js', function () {
  gulp.src(mainBowerFiles())
    .pipe(plugins.filter('*.js', '!**/respond*'))
    .pipe(order([
      'angular.js',
      'jquery.js',
      'bootstrap.js'
    ]))
    .pipe(plugins.concat('vendor.js'))
    //.pipe(plugins.uglify())
    .pipe(gulp.dest('js'));
});

gulp.task('vendor:css', function () {
  gulp.src(mainBowerFiles())
    .pipe(plugins.filter('*.css'))
    .pipe(plugins.concat('vendor.css'))
    .pipe(minifyCSS({}))
    .pipe(gulp.dest('css'));
});

gulp.task('vendor:sass', function () {
  gulp.src(mainBowerFiles())
    .pipe(plugins.filter('*.scss'))
    .pipe(gulp.dest('src/scss/vendor'));
});

gulp.task('vendor:fonts', function () {
  var fontTypes = ['*.eot', '*.woff', '*.woff2', '*.svg', '*.ttf'];
  gulp.src(mainBowerFiles())
    .pipe(plugins.filter(fontTypes))
    .pipe(gulp.dest('fonts'));
});

gulp.task('vendor:all', function () {
  gulp.start('vendor:js', 'vendor:css', 'vendor:fonts');
});

// ------------------------------
// Watch Tasks
// ------------------------------

gulp.task('html', function () {
  gulp.src('*.html').pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('*.html', ['html']);
  gulp.watch('src/**/*.js', ['project:js']);
  gulp.watch('src/**/*.scss', ['project:css']);
});

// ------------------------------
// Project Tasks
// ------------------------------
gulp.task('project:css', function () {
  gulp.src('src/scss/**/*.scss')
    .pipe(plugins.concat('styles.css'))
    .pipe(minifyCSS({}))
    .pipe(gulp.dest('css'));
});

gulp.task('project:js', function () {
  // Add js order in .src, .order unreliable
  gulp.src(['src/js/mainApp.js', 'src/js/**/*.js'])
    .pipe(plugins.concat('main-app.js'))
    .pipe(plugins.wrap('(function (angular, jQuery) {\n"use strict";\n<%= contents %>\n})(angular, jQuery);'))
    .pipe(plugins.uglify({mangle : false}))
    .pipe(gulp.dest('js'))
    .pipe(connect.reload());
});

// ------------------------------
// Default Task
// ------------------------------
gulp.task('default', function () {
  gulp.start('server', 'vendor:all', 'project:js', 'watch');
});