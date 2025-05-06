const express = require('express');
const cors = require('cors');
const path = require('path');
const botHandlers = require('./bot/handlers');
const apiRoutes = require('./src/routes/api');

const app = express();
const port = process.env.PORT || 3000;

// Vide mainīgie
const renderUrl = process.env.RENDER_URL || 'https://planotajs.onrender.com';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Telegram webhook
app.post('/bot/webhook', (req, res) => {
  botHandlers.processUpdate(req.body);
  res.sendStatus(200);
});

// API maršruti
app.use('/api', apiRoutes);

// Statisko failu apkalpošana
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicializē Telegram botu
botHandlers.initBot(telegramBotToken, `${renderUrl}/bot/webhook`);

// Servera palaišana
app.listen(port, () => {
  console.log(`Serveris darbojas uz porta ${port}`);
});
