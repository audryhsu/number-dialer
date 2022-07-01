import { useState, useEffect } from 'react';
import axios from 'axios';
const SERVER_URL = 'http://localhost:5000';

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  useEffect(() => {
    // on first run, fetch the phone number
    const initialFetch = async () => {
      let { data } = await axios.get(`${SERVER_URL}`);
      setPhoneNumbers(data);
    };
    initialFetch();
  }, []);

  const updateNumbers = (newNumberObject) => {
    let updatedPhoneNumbers = phoneNumbers.map((num) => {
      if (num.index === newNumberObject.index) {
        return newNumberObject;
      }
      return num;
    });
    console.log(updatedPhoneNumbers);
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const clickCall = async () => {
    await axios.post(`${SERVER_URL}/call`);
    let eventSource = new EventSource(`${SERVER_URL}/updates`);

    eventSource.addEventListener('open', () => console.log('connection open!'));
    eventSource.addEventListener('message', (event) => {
      let data = JSON.parse(event.data);
      updateNumbers(data);
    });
  };

  return (
    <main>
      <h1>Number Dialer</h1>
      <ul>
        {phoneNumbers.map((numberObject) => {
          return (
            <li key={numberObject.index}>
              #{numberObject.index} {numberObject.number} -{' '}
              {numberObject.status}
            </li>
          );
        })}
      </ul>
      <button type="button" className="button" onClick={clickCall}>
        Call
      </button>
    </main>
  );
}

export default App;
