// bot/handlers.js
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let bot;

function initBot(token, webhookUrl) {
  bot = new TelegramBot(token, { webHook: { port: 3000 } });
  bot.setWebHook(webhookUrl);

  bot.onText(/\/start/, async (msg) => {
    const userId = msg.from.id.toString();
    const firstName = msg.from.first_name || 'draugs';
    const language = msg.from.language_code || 'lv';

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      await supabase.from('users').insert({
        user_id: userId,
        first_name: firstName,
        language,
      });
    }

    bot.sendMessage(msg.chat.id, `Sveiks, ${firstName}! Esmu Tavs Plānotājs. Sāc plānot savus uzdevumus!`);
  });
}

function processUpdate(update) {
  if (bot) {
    bot.processUpdate(update);
  }
}

module.exports = { initBot, processUpdate };
