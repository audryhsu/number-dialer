export class NumberDialer {
  constructor(NUMBERS_TO_CALL) {
    this.numbersCalled = [];
    this.numbersToCall = NUMBERS_TO_CALL;
  }

  dequeueNumbersToCall() {
    const dialedNumber = this.numbersToCall.shift();
    return dialedNumber;
  }

  addToCalledList(dialedNumber, callId) {
    this.numbersCalled.push({
      number: dialedNumber,
      id: callId,
      status: 'idle',
    });
  }

  async call() {
    const payload = {
      phone: this.numbersToCall[0],
      webhookURL: `http://localhost:${process.env.PORT}/updates`,
    };
    let dialedNumber = this.dequeueNumbersToCall();
    try {
      const { data } = await axios.post(
        `http://localhost:${CALL_PORT}${CALL_PATH}`,
        payload
      );
      this.addToCalledList(dialedNumber, data.id);
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