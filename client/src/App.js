import { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css';
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

  const clickCall = async () => {
    await axios.post(`${SERVER_URL}/call`);
    let eventSource = new EventSource(`${SERVER_URL}/updates`);

    eventSource.addEventListener('message', (event) => {
      console.log('message: ', event.data);
    });
  }

  // SSE setup - when receiving a new event, update the current state

  return (
    <main>
      <h1>Number Dialer</h1>
      <ul>
        {phoneNumbers.map((numberObject, idx) => {
          return (
            <li key={idx}>
              {numberObject.number} - {numberObject.status}
            </li>
          );
        })}
      </ul>
      <button type="button"
        className="button"
        onClick={clickCall}>
        Call
      </button>
    </main>
  );
}

export default App;
