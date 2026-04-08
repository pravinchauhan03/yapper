import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import SearchUsers from './SearchUsers';
import FriendsList from './FriendsList';
import { useNavigate } from 'react-router-dom';
import { ConversationSkeleton } from './Skeleton';

const Sidebar = ({ onSelectConversation, selectedConversation }) => {
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user, signOut, getToken } = useAuth();
  const { onlineUsers } = useSocket();
  const { darkMode, toggleDarkMode } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const navigate = useNavigate();
  const [loadingConvos, setLoadingConvos] = useState(true);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/unread/counts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConversation = async (convo) => {
    onSelectConversation(convo);
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/messages/${convo.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCounts(prev => ({ ...prev, [convo.id]: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

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
  } finally {
    setLoadingConvos(false);
  }
};

  const getOtherUser = (convo) => {
    return convo.user1_id === user.id ? convo.user2 : convo.user1;
  };

  return (
    <div style={{
      width: '300px',
      backgroundColor: darkMode ? '#16213e' : '#fff',
      borderRight: `1px solid ${darkMode ? '#0f3460' : '#eee'}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: `1px solid ${darkMode ? '#0f3460' : '#eee'}`,
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c63ff', margin: 0 }}>
          Yapper 💬
        </h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: darkMode ? '#0f3460' : '#f0f2f5', cursor: 'pointer', fontSize: '16px' }}
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: darkMode ? '#0f3460' : '#f0f2f5', cursor: 'pointer', fontSize: '16px' }}
            onClick={() => navigate('/profile')}
          >
            👤
          </button>
          <button
            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: darkMode ? '#0f3460' : '#f0f2f5', cursor: 'pointer', fontSize: '13px', color: darkMode ? '#fff' : '#333' }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${darkMode ? '#0f3460' : '#eee'}` }}>
        {['chats', 'friends', 'search'].map(tab => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: darkMode ? '#16213e' : '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              color: activeTab === tab ? '#6c63ff' : darkMode ? '#aaa' : '#888',
              borderBottom: activeTab === tab ? '2px solid #6c63ff' : '2px solid transparent',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'capitalize',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'chats' && (
  loadingConvos
    ? <>
        <ConversationSkeleton />
        <ConversationSkeleton />
        <ConversationSkeleton />
      </>
    : conversations.length === 0
      ? <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px', fontSize: '14px' }}>No conversations yet</p>
      : conversations.map(convo => {
          const other = getOtherUser(convo);
          const isOnline = onlineUsers.includes(other?.id);
          return (
            <div
              key={convo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: selectedConversation?.id === convo.id
                  ? '#ede9ff'
                  : darkMode ? '#1a1a2e' : '#fff',
                color: darkMode ? '#fff' : '#333',
              }}
              onClick={() => handleSelectConversation(convo)}
            >
              <div style={{
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
              }}>
                {other?.username?.[0]?.toUpperCase()}
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  backgroundColor: isOnline ? '#4caf50' : '#ccc',
                }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500', flex: 1 }}>
                {other?.username}
              </span>
              {unreadCounts[convo.id] > 0 && (
                <span style={{
                  backgroundColor: '#6c63ff',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {unreadCounts[convo.id]}
                </span>
              )}
            </div>
          );
        })
)}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {activeTab === 'chats' && (
          conversations.length === 0
            ? <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px', fontSize: '14px' }}>No conversations yet</p>
            : conversations.map(convo => {
              const other = getOtherUser(convo);
              const isOnline = onlineUsers.includes(other?.id);
              return (
                <div
                  key={convo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    backgroundColor: selectedConversation?.id === convo.id
                      ? '#ede9ff'
                      : darkMode ? '#1a1a2e' : '#fff',
                    color: darkMode ? '#fff' : '#333',
                  }}
                  onClick={() => handleSelectConversation(convo)}
                >
                  <div style={{
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
                  }}>
                    {other?.username?.[0]?.toUpperCase()}
                    <span style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      backgroundColor: isOnline ? '#4caf50' : '#ccc',
                    }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '500', flex: 1 }}>
                    {other?.username}
                  </span>
                  {unreadCounts[convo.id] > 0 && (
                    <span style={{
                      backgroundColor: '#6c63ff',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}>
                      {unreadCounts[convo.id]}
                    </span>
                  )}
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

export default Sidebar;