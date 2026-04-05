const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Create profile after signup
router.post('/create', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Unauthorized' });
  const { username } = req.body;

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) return res.status(200).json({ message: 'Profile already exists' });

  // Check if username is taken
  const { data: takenUsername } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (takenUsername) return res.status(400).json({ error: 'Username already taken' });

  const { data, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, username });

  if (insertError) return res.status(400).json({ error: insertError.message });
  res.status(200).json({ message: 'Profile created!', data });
});

// Get profile by username
router.get('/search/:username', async (req, res) => {
  const { username } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, is_public')
    .eq('username', username)
    .single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.status(200).json(data);
});

// Get my profile
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError) return res.status(404).json({ error: 'Profile not found' });
  res.status(200).json(data);
});

// Update my profile
router.put('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Unauthorized' });
  const { username, bio, avatar_url, is_public } = req.body;
  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({ username, bio, avatar_url, is_public })
    .eq('id', user.id);
  if (updateError) return res.status(400).json({ error: updateError.message });
  res.status(200).json({ message: 'Profile updated!', data });
});

module.exports = router;