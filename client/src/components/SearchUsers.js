import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SearchUsers = () => {
  const { getToken } = useAuth();
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUser = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setMessage('');
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/profiles/search/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError('User not found');
    }
    setLoading(false);
  };

  const sendFriendRequest = async () => {
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/friends/request`,
        { receiver_id: result.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Friend request sent! ✅');
    } catch (err) {
      setMessage('Could not send request. Already sent or already friends.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search by username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchUser()}
        />
        <button style={styles.searchBtn} onClick={searchUser} disabled={loading}>
          {loading ? '...' : '🔍'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {result && (
        <div style={styles.result}>
          <div style={styles.avatar}>
            {result.username?.[0]?.toUpperCase()}
          </div>
          <div style={styles.info}>
            <p style={styles.username}>{result.username}</p>
            {result.is_public && result.bio && (
              <p style={styles.bio}>{result.bio}</p>
            )}
          </div>
          <button style={styles.addBtn} onClick={sendFriendRequest}>
            Add Friend
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '8px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  searchBtn: {
    padding: '10px 14px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  result: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#6c63ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: '15px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  bio: {
    fontSize: '13px',
    color: '#888',
    margin: '2px 0 0',
  },
  addBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '13px',
    textAlign: 'center',
  },
  success: {
    color: '#4caf50',
    fontSize: '13px',
    textAlign: 'center',
  },
};

export default SearchUsers;