var chai   = require('chai'),
    expect = chai.expect,
    path   = require('path'),
    fs     = require('fs'),
    _      = require('lodash');

chai.should();

var DB_NAME = 'things';

var DB     = require('../json-db'),
    Things = new DB(DB_NAME);

function getJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
}

var testData = [
  {
    name: "James",
    job: "Robocop",
    status: "Boosh boosh boosh"
  },{
    name: "Carl Icahn",
    job: "Rich Person",
    status: "My name is strange."
  },{
    name: "J.K. Rowling",
    job: "Author",
    status: "My books are crazy popular."
  }
];

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

  it("Should READ JSON records.", function(done) {

    Things.insert(testData);
    Things.save(function(err) {
      if (err) throw err;
      removeLocalCopy();
    });

    // Clear the local cache of the collection so that it can be fetched.
    function removeLocalCopy() {
      Things.records = [];
      testRead();
    }

    function testRead() {
      Things.count().should.equal(0);
      Things.fetch(function(err) {
        if (err) throw err;
        Things.count().should.equal(3);
        done();
      });
    }

  });

  it("Should UPDATE JSON records.");
  it("Should DELETE JSON records.");
  it("Should RESET the DB.");

});
