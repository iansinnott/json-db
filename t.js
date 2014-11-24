#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var DB = require('./lib');
var Stuff = new DB('stuff');

Stuff.insert({ type: "House", purpose: "Raging" }, function(err, record) {
  if (err) throw err;
  console.log(Stuff.last());
  console.log(record);
  console.log("RAW DATabase: ", require(Stuff._dbPath)); // debug
});
