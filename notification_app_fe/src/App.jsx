import { useState, useEffect } from 'react';
import { Log } from 'logging_middleware';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    Log('frontend', 'info', 'component', 'App component mounted');
  }, []);

  const sendNotification = async () => {
    try {
      await Log('frontend', 'info', 'api', 'Sending notification request');
      
      const response = await fetch('http://localhost:3000/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        setStatus('Notification sent successfully!');
      } else {
        setStatus('Failed to send notification.');
        await Log('frontend', 'error', 'api', 'Notification API returned error');
      }
    } catch (e) {
      setStatus('Error sending notification.');
      await Log('frontend', 'fatal', 'api', 'Failed to connect to backend');
    }
  };

  return (
    <div className="App">
      <h1>Notification System</h1>
      <div style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Enter notification message"
          style={{ padding: '8px', width: '250px', marginRight: '10px' }}
        />
        <button onClick={sendNotification} style={{ padding: '8px 16px' }}>Send Notification</button>
      </div>
      {status && <p>{status}</p>}
    </div>
  );
}

export default App;
