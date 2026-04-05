import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import SearchUsers from './SearchUsers';
import FriendsList from './FriendsList';

const Sidebar = ({ onSelectConversation, selectedConversation }) => {
  const { user, signOut, getToken } = useAuth();
  const { onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUser = (convo) => {
    return convo.user1_id === user.id ? convo.user2 : convo.user1;
  };

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.logo}>Yapper 💬</h2>
        <button style={styles.signOutBtn} onClick={signOut}>Sign out</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'chats' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('chats')}
        >Chats</button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('friends')}
        >Friends</button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'search' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('search')}
        >Search</button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'chats' && (
          conversations.length === 0
            ? <p style={styles.empty}>No conversations yet</p>
            : conversations.map(convo => {
              const other = getOtherUser(convo);
              const isOnline = onlineUsers.includes(other?.id);
              return (
                <div
                  key={convo.id}
                  style={{
                    ...styles.convoItem,
                    backgroundColor: selectedConversation?.id === convo.id ? '#ede9ff' : '#fff'
                  }}
                  onClick={() => onSelectConversation(convo)}
                >
                  <div style={styles.avatar}>
                    {other?.username?.[0]?.toUpperCase()}
                    <span style={{ ...styles.onlineDot, backgroundColor: isOnline ? '#4caf50' : '#ccc' }} />
                  </div>
                  <span style={styles.username}>{other?.username}</span>
                </div>
              );
            })
        )}
        {activeTab === 'friends' && (
          <FriendsList onSelectConversation={onSelectConversation} onRefresh={fetchConversations} />
        )}
        {activeTab === 'search' && (
          <SearchUsers />
        )}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '300px',
    backgroundColor: '#fff',
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eee',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#6c63ff',
    margin: 0,
  },
  signOutBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f0f2f5',
    cursor: 'pointer',
    fontSize: '13px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #eee',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#888',
  },
  activeTab: {
    color: '#6c63ff',
    borderBottom: '2px solid #6c63ff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  convoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '4px',
  },
  avatar: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#6c63ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  onlineDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
  username: {
    fontSize: '15px',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: '40px',
    fontSize: '14px',
  },
};

export default Sidebar;