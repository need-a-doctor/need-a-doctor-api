'use strict';

var argv = require('yargs').argv;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('default', function () {
  var port = argv.p || 9000;
  var environment = argv.e || 'local';

  return $.nodemon({
    script: 'src/app.js',
    ext: 'js',
    env: {
      PORT: port,
      NODE_ENV: environment
    },
    watch: 'src'
  });
});

gulp.task('lint', function () {
  return gulp
    .src([
      'src/**/*.js',
      '!src/config/**',
      '!src/swagger-ui/**'
    ])
    //.pipe($.eslint())
    //.pipe($.eslint.format())
    //.pipe($.eslint.failAfterError());
});

gulp.task('mocha', function () {
  var coverage = !!argv.c;
  var filesScope = argv.files ? 'src/**/' + argv.files : 'src/**/*.spec.js';
  var reporter = argv.r || 'progress';

  return _launchMocha(filesScope, coverage, reporter, argv.once);
});

gulp.task('test', ['mocha'], function () {
  if (!argv.once) {
    return gulp.watch('src/**/*.js', ['mocha']);
  }
});

gulp.task('pre-commit', /*['lint'],*/ function () {
  return _launchMocha('src/**/*.spec.js', false, 'progress', true);
});


function _launchMocha (filesScope, coverage, reporter, once) {
  return gulp
    .src(filesScope, {
      read: false
    })
    .pipe($.spawnMocha({
      istanbul: coverage,
      reporter: reporter,
      env: {
        PORT: 9001,
        NODE_ENV: 'test'
      }
    }))
    .on('error', function (err) {
      if (!once) {
        this.emit('end');
      }
    });
}
