import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div style={styles.container}>
      <Sidebar onSelectConversation={setSelectedConversation} selectedConversation={selectedConversation} />
      <ChatWindow conversation={selectedConversation} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  },
};

export default Chat;