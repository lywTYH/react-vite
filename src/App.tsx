// import { useState } from 'react'
import './App.css';

function App() {
  return (
    <div>
      <h1>websocket </h1>
      <div id="page-wrapper">
        <h1>WebSockets Demo</h1>

        <div id="status">Connecting...</div>

        <ul id="messages"></ul>

        <form id="message-form" action="#" method="post">
          <textarea id="message" placeholder="Write your message here..." required></textarea>
          <button type="submit">Send Message</button>
          <button type="button" id="close">
            Close Connection
          </button>
        </form>
      </div>
      <h1>My age is </h1>
    </div>
  );
}

export default App;
