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

// Send friend request
router.post('/request', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { receiver_id } = req.body;
  const { data, error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: user.id, receiver_id });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Friend request sent!' });
});

// Get all friend requests (received)
router.get('/requests', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase
    .from('friend_requests')
    .select('*, sender:sender_id(username, avatar_url)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Accept friend request
router.put('/request/:id/accept', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  // Update request status
  const { data: request, error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', id)
    .eq('receiver_id', user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  // Add to friends table
  await supabase.from('friends').insert({
    user1_id: request.sender_id,
    user2_id: request.receiver_id
  });

  // Create conversation
  await supabase.from('conversations').insert({
    user1_id: request.sender_id,
    user2_id: request.receiver_id
  });

  res.status(200).json({ message: 'Friend request accepted!' });
});

// Decline friend request
router.put('/request/:id/decline', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined' })
    .eq('id', id)
    .eq('receiver_id', user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Friend request declined!' });
});

// Get all friends
router.get('/', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase
    .from('friends')
    .select('*, user1:user1_id(username, avatar_url), user2:user2_id(username, avatar_url)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Remove friend
router.delete('/:id', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', id)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Friend removed!' });
});

module.exports = router;