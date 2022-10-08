import express, { json } from 'express';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import configJson from './config.json' assert {type: 'json'};

var app = express();

var PORT = 3000;

const token = configJson.token;
const org = configJson.org;
const url = configJson.url;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new InfluxDB({url: url, token: token})

const queryApi = client.getQueryApi(org)

app.get('/', function(req, res) {
    console.log(__dirname);

    res.sendFile(path.join(__dirname, "index.html"));
});

// getting the influx data

app.listen(PORT, function() {
     console.log('Server is on port:', PORT);
});

const query = `from(bucket: "HomeStation") |> range(start: -7d)`
//const query = `from(bucket: "HomeStation") |> range(start: -30d) |> distinct(column: "tag")`

//const query = `SHOW TAG VALUES WITH key = path`;
app.get('/get_weather_data', function(req, res) {
  var array = [];
  
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const fluxMessage = tableMeta.toObject(row);
      array.push(fluxMessage);
      //console.log(`${fluxMessage._time} ${fluxMessage._measurement}: ${fluxMessage._field}=${fluxMessage._value}`)
    },
    error(error) {
      console.error(error);
      console.log('Finished ERROR');
    },
    complete() {
      console.log('Finished SUCCESS');
      res.send(array);
    },
  })

  
});


