// src/routes/api.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/login', async (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'Telegram ID ir obligāts.' });

  try {
    const { data, error } = await supabase.from('users').select('*').eq('user_id', telegram_id).single();
    if (error || !data) return res.status(404).json({ error: 'Lietotājs nav atrasts. Reģistrējieties Telegram botā.' });

    const token = jwt.sign({ user_id: telegram_id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token, user: data });
  } catch (err) {
    res.status(500).json({ error: 'Servera kļūda, mēģiniet vēlreiz.' });
  }
});

router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nav autorizācijas tokena.' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { data, error } = await supabase.from('users').select('*').eq('user_id', decoded.user_id).single();
    if (error || !data) return res.status(404).json({ error: 'Lietotājs nav atrasts.' });

    res.json(data);
  } catch (err) {
    res.status(401).json({ error: 'Nederīgs tokens.' });
  }
});

router.post('/remember-device', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { telegram_id } = req.body;
  if (!token || !telegram_id) return res.status(400).json({ error: 'Nepieciešams tokens un Telegram ID.' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { error } = await supabase.from('users').update({ remember_device: telegram_id }).eq('user_id', decoded.user_id);
    if (error) return res.status(500).json({ error: 'Kļūda, saglabājot ierīci.' });

    res.json({ message: 'Ierīce saglabāta.' });
  } catch (err) {
    res.status(401).json({ error: 'Nederīgs tokens.' });
  }
});

router.get('/remembered-device', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nav autorizācijas tokena.' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { data, error } = await supabase.from('users').select('remember_device').eq('user_id', decoded.user_id).single();
    if (error || !data) return res.status(404).json({ error: 'Lietotājs nav atrasts.' });

    res.json({ telegram_id: data.remember_device || '' });
  } catch (err) {
    res.status(401).json({ error: 'Nederīgs tokens.' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nav autorizācijas tokena.' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { error } = await supabase.from('users').update({ remember_device: null }).eq('user_id', decoded.user_id);
    if (error) return res.status(500).json({ error: 'Kļūda, izlogojoties.' });

    res.json({ message: 'Veiksmīgi izlogots.' });
  } catch (err) {
    res.status(401).json({ error: 'Nederīgs tokens.' });
  }
});

module.exports = router;
