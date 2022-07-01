import dotenv from 'dotenv/config.js';
import express, { request, response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'; // deprecated
import pkg from 'better-sse';
import { CALL_LIMIT, NUMBERS_TO_CALL } from './constants/callApi.js';
import { NumberDialer } from './NumberDialer.js';
const { createSession } = pkg;
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dialer = new NumberDialer(NUMBERS_TO_CALL);
let session;
// api sends webhook
app.post('/updates', (req, res) => {
  console.log('WEBHOOK FROM API:', req.body);
  dialer.updateCallStatus(req.body);

  session.push(req.body);
  res.send();
});

app.get('/', (req, res) => {
  // need to format this accordingly
  let formattedNumbers = dialer.numbersToCall.map((number, index) => {
    return {
      number,
      index,
      status: 'idle',
    };
  });

  res.send(JSON.stringify(formattedNumbers));
});

app.get('/updates', async (req, res) => {
  session = await createSession(req, res);
  session.push('Hello world!');
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

// receiving webhook response
// updating the call_id with new status
// if new status is completed, start the next phone number
// initiating API post request for next call
// relay updates to frontend (websocket?)
// set up server event
// put data in server event
// set headers?
// execute "outputSSE"

// res.write('hello from server')
app.listen(process.env.PORT, () => {
  console.log(`Express app listening on port ${process.env.PORT}`);
});
