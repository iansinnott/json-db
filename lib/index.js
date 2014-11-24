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

  return this;
}

_.extend(DB.prototype, {

  fetch: function(cb) {
    var _this = this;
    fs.readFile(this._dbPath, { encoding: 'utf-8' }, function(err, data) {
      if (err) return cb(err);
      _this.records = JSON.parse(data);
      cb(null, _this.records);
    });
  },

  fetchSync: function() {
    this.records = JSON.parse(
      fs.readFileSync(this._dbPath, { encoding: 'utf-8' })
    );
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
   * Insert a new record into the database.
   * @sync Does not perform I/O. Must call #save for that.
   * @param {object|array} object The object to write to the database.
   * @param {function} object The object to write to the database.
   * @return The newly generated object id
   */
  insert: function(object, cb) {
    var _this = this;

    if (_.isArray(object)) {
      object.forEach(function(obj) {
        _this.insert(obj);
      });
      return (cb) ? this.save(cb) : undefined;
    }

    _.extend(object, {
      id: uuid(),
      synced: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    this.records.push(object);

    if (cb) this.save(cb);

    return object.id;
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

      // Return the last record added to the DB. This is useful when the
      // callback is passed from #insert.
      cb(null, _this.last());
    });
  },

  /**
   * Get a record by ID
   */
  get: function(id) {
    return this.find({ id: id });
  },

  /**
   * Update a record in the database.
   * @param {object|string} The object ot update or its ID
   * @param {function} cb
   */
  update: function(record, set, cb) {
    var id = record,
        entry;

    if (_.isObject(record))
      id = record.id;

    entry = this.get(id);

    if (!entry) return false;

    if (_.isFunction(set))
      entry = set(entry);
    else if (_.isObject(set))
      _.extend(entry, set);

    if (cb) this.save(cb);

    return true;
  },

  /**
   * Remove a record from the database.
   * @todo Still not sure what this should be called. Delete, remove and destroy
   *       all seem appropriate.
   * @param {object|string} The object or its ID
   */
  remove: function(record, cb) {
    if (_.isObject(record)) record = record.id;
    var removed = _.remove(this.records, { id: record });
    if (cb) this.save(cb);
    return removed;
  },

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

var lodashMethods = [
  'where',
  'each',
  'all',
  'any',
  'contains',
  'sortBy',
  'filter',
  'map',
  'find',
  'first',
  'last'
];

// Mixin lodash methods
_.each(lodashMethods, function(method) {
  DB.prototype[method] = function() {
    var args = [].slice.call(arguments);
    args.unshift(this.records);
    return _[method].apply(_, args);
  };
});

module.exports = DB;
