var dbconfig = require('../config/db')
, _ = require('underscore')
, acceptableParams = ['sort', 'order', 'fields']
, sort = false
, handler = {};

function queryHandler(query) {
  var q = query
  , keys = _.keys(q)
  , sort = false
  , order = 1
  , sorting = {}
  , projection = {}
  , tmp = '' //needed for sorts
  , handler = {};

  _.each(keys, function(k) { //for each key (k) in query
    if (_.contains((acceptableParams), k)) {//if any of the keys are in acceptableParams
      if (k === "sort") {
        sort = true;
        sorting[q[k]] = 1;
        tmp = q[k];
      }
      if (sort && k === "order") {
        var option = q[k].toLowerCase();
        if (option === "asc") sorting[tmp] = 1;
        if (option === "desc") sorting[tmp] = -1;
      }
      handler.sort = sorting;
      if (k === "fields") {
        var fields = q[k].split(',');
        for (var i = 0; i<fields.length; i++) {
          fields[i] = fields[i].replace(/ /g,'');
          projection[fields[i]] = 1;
          if (fields[i] !== "_id") {
            projection["_id"] = 0;
          }
        }
        handler.projection = projection;
      }
    }
  });
  return handler;
}

exports.all = function(req, res) {
  var q = req.query;
  if (!_.isEmpty(q)) {
    handler = queryHandler(req.query);
  }

  if (_.has((handler), "projection") && _.has((handler), "sort")) {
    dbconfig.collection.find({}, handler["projection"]).sort(handler["sort"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else if (_.has((handler), "projection")) {
    dbconfig.collection.find({}, handler["projection"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else if (_.has((handler),"sort")) {
    dbconfig.collection.find({}, {}).sort(handler["sort"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else {
    dbconfig.collection.find({}, {}).toArray(function(err, airports){
      res.json(airports);
    });
  }
}

exports.airportIATA = function(req, res) {
  var q = req.query;
  var iataCode = decodeURI(req.params.iata).toUpperCase();

  if (!_.isEmpty(q)) {
    handler = queryHandler(req.query);
  }
  
  if (_.has((handler), "projection")) {
    dbconfig.collection.find({iata_code: iataCode}, handler["projection"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else {
    dbconfig.collection.find({iata_code: iataCode}, {}).toArray(function(err, airports){
      res.json(airports);
    });
  }
}

exports.airportType = function(req, res) {
  airporttype = decodeURI(req.params.airporttype);
  dbconfig.collection.find({ airport_type: airporttype }).toArray(function(err, airports){
    res.json(airports);
  });
}

exports.airportDistance = function(req, res) {
  var q = req.query;
  var distance = decodeURI(req.params.distance);
  distance = distance * 1000;
  var lat = parseFloat(req.query["lat"]);
  var lng = parseFloat(req.query["lng"]);
  var dbq = {'loc': { $near: { $geometry: { 'type': 'Point', 'coordinates': [lng, lat]}}, $maxDistance: distance}};

  if (!_.isEmpty(q)) {
    handler = queryHandler(req.query);
  }
  
  if (_.has((handler), "projection") && _.has((handler), "sort")) {
    dbconfig.collection.find(dbq, handler["projection"]).sort(handler["sort"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else if (_.has((handler), "projection")) {
    dbconfig.collection.find(dbq, handler["projection"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else if (_.has((handler),"sort")) {
    dbconfig.collection.find(dbq, {}).sort(handler["sort"]).toArray(function(err, airports){
      res.json(airports);
    });
  } else {
    dbconfig.collection.find(dbq, {}).toArray(function(err, airports){
      res.json(airports);
    });
  }
}