import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FriendsList = ({ onSelectConversation, onRefresh }) => {
  const { user, getToken } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriends(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/friends/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/friends/request/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
      fetchFriends();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const declineRequest = async (id) => {
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/friends/request/${id}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherFriend = (friend) => {
    return friend.user1_id === user.id ? friend.user2 : friend.user1;
  };

  return (
    <div>
      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('friends')}
        >
          Friends {friends.length > 0 && `(${friends.length})`}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('requests')}
        >
          Requests {requests.length > 0 && `(${requests.length})`}
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0
            ? <p style={styles.empty}>No friends yet. Search for users!</p>
            : friends.map(friend => {
              const other = getOtherFriend(friend);
              return (
                <div key={friend.id} style={styles.item}>
                  <div style={styles.avatar}>
                    {other?.username?.[0]?.toUpperCase()}
                  </div>
                  <span style={styles.username}>{other?.username}</span>
                  <button
                    style={styles.chatBtn}
                    onClick={() => onSelectConversation(friend)}
                  >
                    Chat
                  </button>
                </div>
              );
            })
          }
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0
            ? <p style={styles.empty}>No pending requests</p>
            : requests.map(req => (
              <div key={req.id} style={styles.item}>
                <div style={styles.avatar}>
                  {req.sender?.username?.[0]?.toUpperCase()}
                </div>
                <span style={styles.username}>{req.sender?.username}</span>
                <div style={styles.actions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptRequest(req.id)}
                  >
                    ✓
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => declineRequest(req.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

const styles = {
  tabs: {
    display: 'flex',
    marginBottom: '8px',
  },
  tab: {
    flex: 1,
    padding: '8px',
    border: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#888',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#6c63ff',
    borderBottom: '2px solid #6c63ff',
    fontWeight: 'bold',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    marginBottom: '4px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#6c63ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },
  username: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
  },
  chatBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  acceptBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  declineBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f44336',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '13px',
    marginTop: '20px',
  },
};

export default FriendsList;