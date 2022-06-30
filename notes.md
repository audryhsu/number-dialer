# Front End
**Two Elements**
- List of All Numbers and status of call (or idle)
    - `"ringing", "answered", or "completed"` (add "pending", "failed" ?).
html
<ul>
  <li>PhoneNumber&Status</li>
</ul>

<button>CALL</button>


- `Call` button (one click & disable for session)

# Back End
**Route to Serve front end data @ `GET /`**
  - serving array of objects `{number: xxx, idx: idx, status: idle}`
**Recieve `POST` request from front end `Call` button**
  - `POST /call` sent to API 3 at a time
  - inital response from API `{ "id": 2345 }`
  - webhook route to recieve updates from API
    - `{ "id": 2345, "status": "answered" }`

- Button > `POST /` > Backend
- Backend > `POST /call {phone: number, webhookURL: string}` > API (three initially)
- API > `{ "id": 2345 }` > Backend (> `{number, idx, status= pending}` > Frontend ?)
- API > `{id: num, status: status}` > webhookURL
- Backend > `{${update call}}` > Frontend (Websocket?)

# Progressing through list:
when req to webhookURL where `{status} === "finished"`, make another `POST /call` to API