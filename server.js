import express from 'express';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { InfluxDB, Point } from '@influxdata/influxdb-client'

var app = express();

var PORT = 3000;

const token = 'JcT4vEfQLAAVh3fHBC-BmYsTGF1kM9eKbEo4ZXV-Zpd8BFVgW_L0q78JHRyueQwIOnkdz4--461U9LUy97e53A=='
const org = 'HomeStation'

const client = new InfluxDB({url: 'https://influx.timb.one', token: token})

const queryApi = client.getQueryApi(org)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', function(req, res) {
    console.log(__dirname);

    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, function() {
     console.log('Server is on port:', PORT);
});

const query = `from(bucket: "HomeStation") |> range(start: -7d)`
queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`)
  },
  error(error) {
    console.error(error)
    console.log('Finished ERROR')
  },
  complete() {
    console.log('Finished SUCCESS')
  },
})

