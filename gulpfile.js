const gulp = require('gulp');
const ts = require('gulp-typescript');
const tester = require('gulp-shell');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts', 'test']);
});

gulp.task('assets', function() {
  return gulp.src(JSON_FILES)
  .pipe(gulp.dest('dist'));
});

gulp.task('test', tester.task('npm test'));

gulp.task('watchTest', ['test'], () => {
  gulp.watch('src/test/test.ts')
})

gulp.task('checkProj', ['watch', 'test']);

gulp.task('default', ['checkProj', 'assets']);