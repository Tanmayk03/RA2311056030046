import { useState, useEffect } from 'react';
import { Log } from 'logging_middleware';
import './App.css';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Log('frontend', 'info', 'component', 'App component mounted');
    fetchPriorityNotifications();
  }, []);

  const fetchPriorityNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      await Log('frontend', 'info', 'api', 'Fetching priority inbox');
      
      const response = await fetch('http://localhost:3000/api/notifications/priority');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        await Log('frontend', 'info', 'api', 'Successfully fetched priority inbox');
      } else {
        setError('Failed to fetch notifications.');
        await Log('frontend', 'error', 'api', 'Priority API returned error');
      }
    } catch (e) {
      setError('Error connecting to server.');
      await Log('frontend', 'fatal', 'api', 'Failed to connect to backend priority inbox');
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Placement': return { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px' };
      case 'Result': return { backgroundColor: '#cce5ff', color: '#004085', padding: '4px 8px', borderRadius: '4px' };
      case 'Event': return { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px' };
      default: return { backgroundColor: '#e2e3e5', color: '#383d41', padding: '4px 8px', borderRadius: '4px' };
    }
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Campus Notification Center</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
        <h2>Priority Inbox (Top 10)</h2>
        <button 
          onClick={fetchPriorityNotifications} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Refreshing...' : 'Refresh Inbox'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {loading && notifications.length === 0 ? (
        <p>Loading notifications...</p>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.ID} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={getTypeStyle(notif.Type)}><strong>{notif.Type}</strong></span>
                  <span style={{ fontSize: '0.85em', color: '#666' }}>{notif.Timestamp}</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.1em' }}>{notif.Message}</p>
                <small style={{ color: '#aaa', fontSize: '0.75em' }}>ID: {notif.ID}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
