const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rfs = require('rotating-file-stream'); // version 2.x
const api = require('./routes/api');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionSuccessStatus: 200,
};

// create a rotating write stream
let accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log'),
});

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', api);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
