const gulp = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const gutil = require('gulp-util');
//const tester = require('gulp-shell');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watchEvent', ['scripts'], () => {
  gulp.watch(['src/Event.ts', 'src/Tests/test.ts'], ['scripts', 'mocha_event']);
});

gulp.task('assets', function() {
  return gulp.src(JSON_FILES)
  .pipe(gulp.dest('dist'));
});

gulp.task('mocha_event', ['scripts'], function() {
  return gulp.src(['./dist/Tests/test.js'], { read: false })
      .pipe(mocha({ reporter: 'list' }))
      .on('error', gutil.log);
});

gulp.task('mocha_eventManager', ['scripts'], function() {
  return gulp.src(['./dist/Tests/EventManagerTests.js'], { read: false })
      .pipe(mocha({ reporter: 'list' }))
      .on('error', gutil.log);
});

gulp.task('mocha_PGEvent', ['scripts'], function() {
  return gulp.src(['./dist/Tests/PGEventLinkTests.js'], { read: false })
      .pipe(mocha({ reporter: 'list' }))
      .on('error', gutil.log);
});

gulp.task('watchEventManager', ['scripts'], () => {
  gulp.watch(['src/EventManager.ts', 'src/Tests/EventManagerTests.ts'], ['scripts', 'mocha_eventManager']);
});

gulp.task('watchPGEvent', ['scripts'], () => {
  gulp.watch(['src/PGEventLink.ts', 'src/Tests/PGEventLinkTests.ts'], ['scripts', 'mocha_PGEvent']);
});

gulp.task('checkEvent',['watchEvent', 'mocha_event']);

gulp.task('checkEventManager', ['watchEventManager', 'mocha_eventManager']);

gulp.task('checkPGEvent', ['watchPGEvent', 'mocha_PGEvent'])

gulp.task('checkProj', ['checkEvent', 'checkEventManager', 'checkPGEvent']);

gulp.task('default', ['checkProj', 'assets']);