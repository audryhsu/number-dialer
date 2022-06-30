import { useState, useEffect } from 'react';
import axios from 'axios';
const SERVER_URL = "http://localhost:5000"

let eventSource = new EventSource(`${SERVER_URL}`)
console.log('connection status', eventSource.readyState);

eventSource.on('open', () => {
  console.log('connection open!')
})
eventSource.on('message', (event) => {
  console.log('message: ', event.data)
})
function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  useEffect(() => {
    // on first run, fetch the phone number
    const initialFetch = async () => {
      let { data } = await axios.get(`${SERVER_URL}`);
      console.log(data)
      setPhoneNumbers(data);
    }
    initialFetch();
  }, [])

  const clickCall = (e) => {
    axios.post(`${SERVER_URL}/call`)
  }

  // SSE setup - when receiving a new event, update the current state

  return (
    <main>
      <h1>Number Dialer</h1>
      <ul>
        {phoneNumbers.map(numberObject => {
          return (
            <li>{numberObject.number} - {numberObject.status}</li>
          )
        })}
      </ul>
      <button 
      onClick={clickCall}
      style={{
        
      }}
      >Call</button>
    </main>
  );
}

export default App;
