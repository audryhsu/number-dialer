import axios from 'axios';
import { CALL_PATH, CALL_PORT } from './constants/callApi.js';

export class NumberDialer {
  constructor(NUMBERS_TO_CALL) {
    this.numbersCalled = [];
    this.numbersToCall = NUMBERS_TO_CALL;
    this.fullList = NUMBERS_TO_CALL.map((number, idx) => {
      return {
        number,
        phoneId: idx,
        callId: null,
      };
    });
    this.currentIdx = 0;
  }
  /*
  iinput : [num, num]
  dial: num, --> call obje{callId: 1, status: pending }
  -remove dialled num from queue
  - add call object to numbers called list
    - add property with phone num ID
    
  webhook updates callid1: status: answered
    - numbersCalled --> findby callId and update status
    
    - SSE sends updated number with idx
  
    {
      number,
      index,
      status: 'idle',
    };
  */

  dequeueNumbersToCall() {
    const dialedNumber = this.numbersToCall.shift();
    return dialedNumber;
  }

  addToCalledList(dialedNumber, callId, index) {
    this.numbersCalled.push({
      number: dialedNumber,
      id: callId,
      status: 'idle',
      index,
    });
  }

  async call() {
    const payload = {
      phone: this.numbersToCall[0],
      webhookURL: `http://localhost:${process.env.PORT}/updates`,
    };
    let dialedNumber = this.dequeueNumbersToCall();
    // look up dialedNumber's phoneid

    try {
      let idx = this.currentIdx;
      this.currentIdx++;
      const { data } = await axios.post(
        `http://localhost:${CALL_PORT}${CALL_PATH}`,
        payload
      );
      this.addToCalledList(dialedNumber, data.id, idx);
    } catch (e) {
      console.error(e.error);
    }
  }

  updateCallStatus({ id, status }) {
    if (status === 'completed' && this.numbersToCall.length) {
      console.log('COMPLETED', id);
      this.call();
    }
    this.numbersCalled = this.numbersCalled.map((number) => {
      if (number.id === id && number.status !== 'completed') {
        return { ...number, status };
      } else {
        return number;
      }
    });
  }
}
