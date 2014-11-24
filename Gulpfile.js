var gulp  = require('gulp'),
    path  = require('path'),
    fs    = require('fs'),
    shell = require('shelljs');

var separator = "************************************************************" +
                "********************";

gulp.task('test', function() {
  console.log(separator);
  shell.exec('mocha');
  console.log(separator);
});

gulp.task('watch', function() {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test', 'watch']);
