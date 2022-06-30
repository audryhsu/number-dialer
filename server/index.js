import dotenv from 'dotenv/config.js'
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { CALL_PATH, CALL_PORT, CALL_LIMIT, NUMBERS_TO_CALL } from './constants/callApi.js';
import { NumberDialer } from './NumberDialer.js';

const app = express();
app.use(express.json());
app.use(cors());

const dialer = new NumberDialer(NUMBERS_TO_CALL);

// frontend loads
app.get('/', (req, res) => {
  // need to format this accordingly
  let formattedNumbers = dialer.numbersToCall.map((number, index) => {
    return {
      number,
      index,
      status: 'idle'
    }
  })
  res.send(JSON.stringify(formattedNumbers));
});

// frontend clicks the call button
app.post('/call', (req, res) => {
  let counter = 0;
  while (counter < CALL_LIMIT) {
    dialer.call();
    counter++;
  }
  res.status(200).send('good job');
});

// api sends webhook
app.post('/updates', (req, res) => {
  console.log('WEBHOOK FROM API:', req.body);
  dialer.updateCallStatus(req.body);
  // receiving webhook response
  // updating the call_id with new status
  // if new status is completed, start the next phone number
  // initiating API post request for next call
  // relay updates to frontend (websocket?)
  res.status(200).send('thank you');
});

app.listen(process.env.PORT, () => {
  console.log(`Express app listening on port ${process.env.PORT}`);
});
