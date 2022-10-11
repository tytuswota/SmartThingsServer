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

app.use(express.static(__dirname + '/assets/'));

const client = new InfluxDB({url: url, token: token})

const queryApi = client.getQueryApi(org)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/config', function(req, res) {
  res.sendFile(path.join(__dirname, "config.json"))
});

//gets the javascript script
app.get('/assets/scripts/map.js', function(req, res)
{
  res.sendFile(path.join(__dirname, "/assets/scripts/map.js"))
});

//gets css
app.get('/assets/styles/app.css', function(req, res)
{
  res.sendFile(path.join(__dirname, "/assets/styles/app.css"))
});


// getting the influx data

app.listen(PORT, function() {
     console.log('Server is on port:', PORT);
});

//const query = `from(bucket: "HomeStation") |> range(start: -7d)`
const query = `from(bucket: "HomeStation")
|> range(start: -1h)
|> filter(fn: (r) => r["_measurement"] == "HomeStation")
|> last()
|> group(columns: ["tag"])
|> yield(name: "last")`
                
// const query = `from(bucket: "HomeStation") 
//   |> range(start: -30d) 
//   |> sort()
//   |> distinct(column: "tag")`

app.get('/get_weather_data', function(req, res) {
  var array = [];
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const fluxMessage = tableMeta.toObject(row);
      array.push(fluxMessage);
    },
    error(error) {
      console.error(error);
      console.log('Finished ERROR');
    },
    complete() {
      console.log('Finished SUCCESS');
      // console.log(array);
      res.send({array});
    },
  })

  
});


