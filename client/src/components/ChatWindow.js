import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { MessageSkeleton } from './Skeleton';

const ChatWindow = ({ conversation }) => {
  const [readBy, setReadBy] = useState(null);
  const { user, getToken } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      socket?.emit('join_conversation', conversation.id);
      socket?.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
      socket?.on('user_typing', (username) => {
        setTypingUser(username);
        setIsTyping(true);
      });
      socket?.on('user_stop_typing', () => {
        setIsTyping(false);
        setTypingUser('');
      });
      socket?.on('messages_read', ({ conversationId, userId }) => {
        if (conversationId === conversation?.id) {
          setReadBy(userId);
        }
      });
    }
    return () => {
      socket?.off('receive_message');
      socket?.off('user_typing');
      socket?.off('user_stop_typing');
      socket?.off('messages_read');
    };
  }, [conversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/${conversation.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);

      // Mark as read and emit socket event
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/messages/${conversation.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket?.emit('messages_read', {
        conversationId: conversation.id,
        userId: user.id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await getToken();
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages/${conversation.id}`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket?.emit('send_message', {
        ...res.data.data,
        conversation_id: conversation.id,
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      socket?.emit('stop_typing', { conversationId: conversation.id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket?.emit('typing', {
      conversationId: conversation.id,
      username: user.email,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { conversationId: conversation.id });
    }, 1500);
  };

  const getOtherUser = () => {
    return conversation.user1_id === user.id
      ? conversation.user2
      : conversation.user1;
  };

  if (!conversation) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: darkMode ? '#1a1a2e' : '#f0f2f5',
      }}>
        <h2 style={{ color: '#aaa', fontWeight: 'normal', fontSize: '18px' }}>
          Select a conversation to start chatting 💬
        </h2>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: darkMode ? '#1a1a2e' : '#f0f2f5',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: darkMode ? '#16213e' : '#fff',
        borderBottom: `1px solid ${darkMode ? '#0f3460' : '#eee'}`,
      }}>
        <div style={{
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
        }}>
          {getOtherUser()?.username?.[0]?.toUpperCase()}
        </div>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: darkMode ? '#fff' : '#333' }}>
          {getOtherUser()?.username}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {loadingMessages ? (
          <>
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
          </>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isMine = msg.sender_id === user.id;
              return (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                }}>
                  <div
                    className={isMine ? 'message-bubble-right' : 'message-bubble-left'}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '16px',
                      maxWidth: '60%',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      backgroundColor: isMine ? '#6c63ff' : darkMode ? '#16213e' : '#fff',
                      color: isMine ? '#fff' : darkMode ? '#fff' : '#333',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {msg.content}
                  </div>
                  {isMine && isLast && (
                    <span style={{
                      fontSize: '11px',
                      color: msg.is_read || readBy ? '#6c63ff' : '#aaa',
                      marginTop: '2px',
                      marginRight: '4px',
                    }}>
                      {msg.is_read || readBy ? '✓✓ Seen' : '✓ Sent'}
                    </span>
                  )}
                </div>
              );
            })}
            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                backgroundColor: darkMode ? '#16213e' : '#fff',
                borderRadius: '16px',
                alignSelf: 'flex-start',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px',
        backgroundColor: darkMode ? '#16213e' : '#fff',
        borderTop: `1px solid ${darkMode ? '#0f3460' : '#eee'}`,
      }}>
        <input
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: `1px solid ${darkMode ? '#0f3460' : '#ddd'}`,
            fontSize: '15px',
            outline: 'none',
            backgroundColor: darkMode ? '#1a1a2e' : '#fff',
            color: darkMode ? '#fff' : '#333',
          }}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          style={{
            padding: '12px 24px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: '#6c63ff',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;