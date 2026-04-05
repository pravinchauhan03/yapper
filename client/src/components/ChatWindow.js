import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ChatWindow = ({ conversation }) => {
  const { user, getToken } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    }

    return () => {
      socket?.off('receive_message');
      socket?.off('user_typing');
      socket?.off('user_stop_typing');
    };
  }, [conversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages/${conversation.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
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
      <div style={styles.empty}>
        <h2 style={styles.emptyText}>Select a conversation to start chatting 💬</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {getOtherUser()?.username?.[0]?.toUpperCase()}
        </div>
        <span style={styles.username}>{getOtherUser()?.username}</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender_id === user.id ? '#6c63ff' : '#fff',
              color: msg.sender_id === user.id ? '#fff' : '#333',
            }}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div style={styles.typing}>{typingUser} is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontWeight: 'normal',
    fontSize: '18px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
  },
  avatar: {
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
  },
  username: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  messageBubble: {
    padding: '10px 16px',
    borderRadius: '16px',
    maxWidth: '60%',
    fontSize: '15px',
    lineHeight: '1.4',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  typing: {
    color: '#aaa',
    fontSize: '13px',
    fontStyle: 'italic',
    padding: '4px 8px',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px 24px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default ChatWindow;