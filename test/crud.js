var chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash');

var fs = require('fs'),
    path = require('path');

chai.should();

var DB_NAME = 'things';

var DB     = require('../json-db'),
    Things = new DB(DB_NAME);

function getJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
}

describe('JSON DB CRUD', function() {

  beforeEach(function() {
    // beforeEach:Reset the database before each test.
    Things.reset();
    // console.log("Database reset"); // debug
  });

  it("True should be true", function() { true.should.be.true; });

  it("Module should exist", function() {
    Things.should.not.be.undefined;
  });

  it("Should initialize an empty database.", function() {
    var data;

    expect(function() {
      data = fs.readFileSync(path.resolve('./db/' + DB_NAME + '.json'),{
        encoding: 'utf-8'
      });
    }).to.not.throw();

    data.should.equal("[]");
  });

  it("Should CREATE in-memory records", function() {
    Things.count().should.equal(0);
    var id = Things.insert({ type: "Toy", name: "Dollhouse" });
    Things.count().should.equal(1);
  });

  it("Should save records to disk as json.", function(done) {
    Things.insert({ type: "Toy", name: "Dollhouse" }, function(err, object) {
      var raw = _.last(getJSON(Things._dbPath));
      expect(raw).to.eql(object);
      done();
    });
  });

  it("Should READ JSON records.");
  it("Should UPDATE JSON records.");
  it("Should DELETE JSON records.");
  it("Should RESET the DB.");

});
