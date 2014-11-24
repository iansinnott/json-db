var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

function DB(collectionName, options) {

  var _this = this;

  options = _.defaults(options || {}, {
    directory: './db' // Where to store the DB
  });

  this.records = this.records || [];
  this._collectionName = collectionName;
  this.options = options;
  this._dbPath = path.resolve(path.join(options.directory,
                                        collectionName + '.json'));
  // Initialize with existing records, or create a new database.
  try {
    this.records = require(this._dbPath);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'MODULE_NOT_FOUND') { // No file exists
      this._initializeDB(this._dbPath);
    } else if (err.code === 'EACCES') { // Permissions error
      console.error([
          "Database exists but is not readable. Check permissions on the file:",
          err.path
        ].join("\n"));
      process.exit(1);
    }
  }

  // Mixin lodash methods
  [
    'where',
    'each',
    'all',
    'any',
    'contains',
    'sortBy',
    'filter',
    'map'
  ].forEach(function(funcName) {
    DB.prototype[funcName] = _.bind(_[funcName], null, _this.records);
  });

  return this;
}

_.extend(DB.prototype, {

  /**
   * This wasn't working when I bound it as with the other functions above.
   */
  last: function(array) { return _.last(this.records); },
  first: function(array) { return _.first(this.records); },

  fetch: function(cb) {
    fs.readFile(this._dbPath, function(err, data) {
      if (err) return cb(err);
      this.records = JSON.parse(data);
      cb(null, this.records);
    });
  },

  fetchSync: function() {
    this.records = require(this._dbPath);
    return this.records;
  },

  /**
   * Initialize a new database at the given path.
   * @param {string} path
   * @return
   */
  _initializeDB: function(path) {
    return fs.writeFileSync(path, JSON.stringify([]));
  },

  /**
   * Return the number of records in the database.
   */
  count: function() {
    return this.records.length;
  },

  /**
   * Find all records that match where. If no criteria is given, return all
   * records.
   * @return {array} Can be empty
   */
  find: function(where) {
    return [];
  },

  /**
   * Insert a new record into the database.
   * @sync Does not perform I/O. Must call #save for that.
   * @param {object} object The object to write to the database.
   * @param {function} object The object to write to the database.
   * @return The newly generated object id
   */
  insert: function(object, cb) {

    _.extend(object, {
      id: uuid(),
      synced: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    this.records.push(object);

    if (_.isUndefined(cb))
      return object.id;

    this.save(cb);
  },

  /**
   * Write the contents of the in-memory database to disk. Records are not
   * permanent until the save function has been called.
   * @async
   * @param {function} cb(err, data)
   * @return {this}
   */
  save: function(cb) {
    var _this     = this,
        notSynced = this.where({ synced: false });

    _.each(notSynced, function(record) { record.synced = true; });

    fs.writeFile(this._dbPath, JSON.stringify(this.records), function(err) {

      // If something goes wrong make sure the records are marked as not synced.
      if (err) {
        _.each(notSynced, function(record) { record.synced = false; });
        return cb(err);
      }

      console.log("Calling callback"); // debug
      cb(null, _this.last());
    });
  },

  /**
   * Update a record in the database.
   * @param {object|string} The object ot update or its ID
   * @param {function} cb
   */
  update: function(object, cb) {  },

  /**
   * Remove a record from the database.
   * @todo Still not sure what this should be called. Delete, remove and destroy
   *       all seem appropriate.
   * @param {object|string} The object or its ID
   */
  remove: function(object) {  },

  /**
   * Reset the database. The _initializeDB method itself does not check for a
   * files existince, and will thus happilly blow away all contents of the file
   * at {path} and replace them with an empty collection (array).
   * @sync
   */
  reset: function() {
    this.records = [];
    return this._initializeDB(this._dbPath);
  }

});

module.exports = DB;
