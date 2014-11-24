#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var DB = require('./lib');
var Stuff = new DB('stuff');

// console.log(_.last(require(Stuff._dbPath))); // debug
Stuff.insert({ type: "House", purpose: "Raging" }, function(err, record) {
  if (err) throw err;
  console.log(Stuff.last());
  console.log(record);
  console.log("RAW DATabase: ", require(Stuff._dbPath)); // debug
});

// Stuff.save(function(err) {
//   if (err) throw err;
//   console.log("Async call completed"); // debug
//   console.log(Stuff.records.length); // debug
// });
