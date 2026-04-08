const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper to get user from token
const getUser = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return user;
};

// Get all conversations
router.get('/conversations', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase
    .from('conversations')
    .select('*, user1:user1_id(username, avatar_url), user2:user2_id(username, avatar_url)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Get messages in a conversation
router.get('/:conversationId', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { conversationId } = req.params;

  // Check user is part of conversation
  const { data: convo, error: convoError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();
  if (convoError) return res.status(403).json({ error: 'Access denied' });

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(username, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Send a message
router.post('/:conversationId', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { conversationId } = req.params;
  const { content } = req.body;

  // Check user is part of conversation
  const { data: convo, error: convoError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();
  if (convoError) return res.status(403).json({ error: 'Access denied' });

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, content })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Message sent!', data });
});

// Mark messages as read
router.put('/:conversationId/read', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { conversationId } = req.params;
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Messages marked as read' });
});

// Get unread count for all conversations
router.get('/unread/counts', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id')
    .eq('is_read', false)
    .neq('sender_id', user.id);
  if (error) return res.status(400).json({ error: error.message });

  const counts = {};
  data.forEach(msg => {
    counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
  });
  res.status(200).json(counts);
});

module.exports = router;