import dotenv from 'dotenv/config.js';
import express, { request, response } from 'express';
import cors from 'cors';
import { CALL_LIMIT, NUMBERS_TO_CALL } from './constants/callApi.js';
import { NumberDialer } from './NumberDialer.js';
const app = express();


const dialer = new NumberDialer(NUMBERS_TO_CALL);
const client = { stream: null }; // stores response object to stream SSE

app.use(express.json());
app.use(cors());

// endpoint for clients to start ws connection
app.get('/updates', async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);
  res.write(`data: hello from server`);
  res.write('\n\n');
  client.stream = res; // store response obj to be written to later
});

// receives webhooks from numDialer API and streams call status changes
app.post('/updates', (req, res) => {
  dialer.updateCallStatus(req.body);

  const receivedNumber = dialer.numbersCalled.filter((num) => {
    return num.id === req.body.id;
  })[0];

  client.stream.write(`data: ${JSON.stringify(receivedNumber)}`); // Note: string must start with "data: " 
  client.stream.write('\n\n'); // Note: this must be a separate write from data (above)
  res.send();
});

// provides frontend with list of phone numbers to call
app.get('/', (req, res) => {
  // TODO: need to format this accordingly
  let formattedNumbers = dialer.numbersToCall.map((number, index) => {
    return {
      number,
      index,
      status: 'idle',
    };
  });

  res.send(JSON.stringify(formattedNumbers));
});


// call list of numbers numbers 
app.post('/call', (req, res) => {
  let counter = 0;

  while (counter < CALL_LIMIT) {
    dialer.call();
    counter++;
  }
  res.status(200).send('good job');
});

app.listen(process.env.PORT, () => {
  console.log(`Express app listening on port ${process.env.PORT}`);
});
