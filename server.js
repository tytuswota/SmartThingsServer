import express from 'express';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import cors from 'cors';
import configJson from './config.json' assert {type: 'json'};

var app = express();
app.use(cors());

var PORT = 3000;

const token = configJson.token;
const org = configJson.org;
const url = configJson.url;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new InfluxDB({url: url, token: token})

const queryApi = client.getQueryApi(org)



app.get('/', cors(), function(req, res) {
    console.log(__dirname);

    res.sendFile(path.join(__dirname, "index.html"));
});

// getting the influx data

app.listen(PORT, function() {
     console.log('Server is on port:', PORT);
});

const query = `from(bucket: "HomeStation") |> range(start: -7d)`
app.post('/get_weather_data', cors(), function(req, res) {
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const fluxMessage = tableMeta.toObject(row);
      res.sendDate(fluxMessage);
      //console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`)
    },
    error(error) {
      console.error(error);
      console.log('Finished ERROR');
    },
    complete() {
      console.log('Finished SUCCESS');
    },
  })
});


