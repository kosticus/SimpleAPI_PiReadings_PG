var express     = require('express');
var Path        = require('path');
var bodyParser  = require('body-parser');
var pg          = require('pg');

var app         = express();

var port        = process.env.PORT || 4001;

var conString   = 'pg://localhost:5432/development';
var client      = new pg.Client(conString);
client.connect();

// Parse request body as JSON
app.use(bodyParser.json());

// Create schema when server starts
//jscs:disable
client.query('CREATE TABLE IF NOT EXISTS readings(ids SERIAL PRIMARY KEY, serial_id INTEGER,reading_number INTEGER, timestamp TIMESTAMP);');
//jscs:enable
console.log('Successfully applied schema');

// Get count of records from DB
app.get('/count', function (req, res) {
  client.query('SELECT count(*) FROM readings;')
  .on('end', function (result) {
    res.status(201).send(JSON.stringify(result.rows[0].count));
  });
});

// Insert serial number, reading number, and timestamp into DB
// ** WHen this endpoint is hit with no queries, serve HTML file (for testing)
app.get('/', function (req, res) {
  var serial = req.query.serial;
  var reading = req.query.reading;
  var timeNow = new Date();

  if (serial && reading) {
    //jscs:disable
    client.query('INSERT INTO readings(serial_id, reading_number, timestamp) values($1, $2, $3)', [serial, reading, timeNow])
    //jscs:enable
    .on('end', function () {
      res.status(201).send(JSON.stringify('Successfully inserted into database'));
    });
  } else {
    // Serve HTML (for testing)
    res.status(200).sendFile(Path.resolve(__dirname, '../client/public/index.html'));
  }
});

// Catch-all route
app.get('/*', function (req, res) {
  res.status(404).send(JSON.stringify('Uh oh'));
});

app.listen(port);
console.log('Listening on port: ', port);
