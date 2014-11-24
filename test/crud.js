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

  it("Should be able to create multiple entries from an array", function() {
    Things.count().should.equal(0);
    Things.insert(testData, function(err) {
      if (err) throw err;
      Things.count().should.equal(testData.length);
    });
  });

  it("Should READ JSON records.", function(done) {
    Things.insert(testData);
    Things.save(function(err) {
      if (err) throw err;
      testRead();
    });

    function testRead() {

      // Clear the local cache of the collection so that it can be fetched.
      Things.records = [];

      Things.count().should.equal(0);

      // Now read the data from the db
      Things.fetch(function(err) {
        if (err) throw err;
        Things.count().should.equal(3);
        done();
      });
    }

  });

  it("Should UPDATE JSON records.", function(done) {
    Things.insert(testData, afterInsertion);

    function afterInsertion(err) {
      if (err) throw err;

      var entry = Things.first(),
          originalName = entry.name,
          update;

      // Test local updating
      update = Things.update(entry, { name: 'Face House' });
      update.should.be.ok;
      entry.name.should.not.equal(originalName);

      // Can use IDs
      update = Things.update(entry.id, { name: 'James' });
      update.should.be.ok;
      entry.name.should.equal(originalName);

      // Pass a callback to trigger a save
      Things.update(entry, { name: 'Spongebob' }, function(err) {
        if (err) throw err;
        Things.get(entry.id).name.should.equal('Spongebob');
        Things.where({ name: 'James'}).should.be.empty;

        // Reset the name locally to make sure that the update did not affect
        // the DB
        Things.update(entry, { name: 'James' });

        Things.fetch(testFetch);
      });

      function testFetch(err) {
        if (err) throw err;
        Things.where({ name: 'James'}).should.be.empty;
        Things.where({ name: 'Spongebob'}).length.should.equal(1);
        done();
      }
    }

  });

  it("Should DELETE JSON records.", function(done) {
    Things.insert(testData, afterInsertion);

    function afterInsertion(err) {
      if (err) throw err;

      var entry = Things.first();

      Things.count().should.equal(3);

      Things.remove(entry);
      Things.count().should.equal(2);
      Things.fetch(afterFetch);
    }

    function afterFetch(err) {
      if (err) throw err;

      var entry = Things.first();

      Things.count().should.equal(3);

      Things.remove(entry, afterRemove);
    }

    function afterRemove(err) {
      if (err) throw err;
      Things.count().should.equal(2);
      Things.fetchSync();
      Things.count().should.equal(2);
      done();
    }

  });

  it("Should RESET the DB.", function(done) {
    Things.insert(testData, afterInsertion);

    function afterInsertion(err) {
      if (err) throw err;
      Things.count().should.equal(3);
      Things.reset();
      Things.count().should.equal(0);
      Things.fetchSync();
      Things.count().should.equal(0);
      done();
    }
  });

});
