/**
 * server.js — Express + node-telegram-bot-api
 *
 * Запускает:
 *   1) Express-сервер, раздающий Mini App (public/index.html) по HTTPS-домену
 *   2) Telegram-бота, который присылает кнопку "Открыть Mini App"
 *
 * Требуется .env с BOT_TOKEN и WEBAPP_URL (см. .env.example).
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

const tokenValid = BOT_TOKEN && BOT_TOKEN !== 'PUT_YOUR_BOT_TOKEN_HERE';
const webappValid = WEBAPP_URL && !WEBAPP_URL.includes('your-ngrok-subdomain');

if (!tokenValid) {
  console.warn('\n[!] BOT_TOKEN не задан в .env — бот не запустится.');
  console.warn('    Получите токен у @BotFather (команда /newbot) и впишите его в .env');
  console.warn('    Mini App всё равно будет доступен локально для тестирования.\n');
}

if (tokenValid && !webappValid) {
  console.warn('\n[!] WEBAPP_URL не задан или это placeholder.');
  console.warn('    Mini App откроется локально, но Telegram примет URL только если он HTTPS.');
  console.warn('    Запустите ngrok (npm run ngrok) и подставьте https-URL в .env\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Express: раздаём Mini App
// ─────────────────────────────────────────────────────────────────────────────
const app = express();

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '0',
  setHeaders: (res) => {
    // Не кэшируем — Mini App часто меняется во время разработки
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), bot: tokenValid, webapp: webappValid });
});

app.listen(PORT, () => {
  console.log(`\n[express] Mini App: http://localhost:${PORT}/`);
  console.log(`[express] Health:   http://localhost:${PORT}/health\n`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Telegram bot — запускаем только если токен задан
// ─────────────────────────────────────────────────────────────────────────────
let bot = null;
if (tokenValid) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  const MAIN_MENU = {
    reply_markup: {
      keyboard: [
        [{ text: '🎨 Открыть Mini App', web_app: { url: WEBAPP_URL } }],
        [{ text: 'ℹ️ Помощь' }, { text: '🌱 Сиды дня' }]
      ],
      resize_keyboard: true,
      is_persistent: false
    }
  };

  const INLINE_OPEN = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎨 Открыть генератор', web_app: { url: WEBAPP_URL } }]
      ]
    }
  };

  const HELP_TEXT = [
    '*Как пользоваться*',
    '',
    '1️⃣ Нажмите кнопку *«🎨 Открыть Mini App»* — откроется интерактивный генератор.',
    '2️⃣ Слева выберите алгоритм: *Flow Field* или *Quantum Harmonics*.',
    '3️⃣ Крутите слайдеры — живопись обновляется в реальном времени.',
    '4️⃣ Меняйте сид (вручную или кнопками ←/→/↻) — каждый сид = новая картина.',
    '5️⃣ Жмите *«Скачать PNG»* или *«Поделиться в Telegram»*.',
    '',
    '*Пресеты* — готовые удачные комбинации параметров.',
    '*Сиды дня* — три случайных сида, на которые сегодня стоит посмотреть.',
    '',
    'Все алгоритмы основаны на навыке [algorithmic-art](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art) от Anthropic.'
  ].join('\n');

  bot.setMyCommands([
    { command: 'start',  description: 'Запустить бота' },
    { command: 'help',   description: 'Помощь' },
    { command: 'open',   description: 'Открыть Mini App' },
    { command: 'seed',   description: 'Три случайных сида дня' }
  ]).catch(err => console.error('[bot] setMyCommands error:', err.message));

  bot.onText(/^\/start/, (msg) => {
    const name = msg.from?.first_name ? `, ${msg.from.first_name}` : '';
    bot.sendMessage(
      msg.chat.id,
      `Привет${name}! 👋\n\nЭто студия алгоритмической живописи. Я рисую картины кодом — потоки частиц, волновая интерференция, всё на p5.js.\n\nНажмите кнопку ниже, чтобы открыть генератор.`,
      MAIN_MENU
    );
  });

  bot.onText(/^\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: 'Markdown', disable_web_page_preview: true });
  });

  bot.onText(/^\/open/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Открываю генератор…', INLINE_OPEN);
  });

  bot.onText(/^\/seed/, (msg) => {
    const today = new Date().toDateString();
    const baseSeed = Math.abs(hashCode(today)) % 999999 + 1;
    const seeds = [baseSeed, baseSeed + 7, baseSeed + 42];
    const text = `🌱 *Сиды дня* (${today})\n\n` +
      seeds.map((s, i) => `${['🥇','🥈','🥉'][i]} \`${s}\``).join('\n') +
      `\n\nВведите эти числа в поле Seed в Mini App.`;
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown', ...INLINE_OPEN });
  });

  bot.on('message', (msg) => {
    if (msg.web_app_data) {
      bot.sendMessage(msg.chat.id, `🎨 Получены данные из Mini App:\n\n${msg.web_app_data.data}`);
      return;
    }
    if (msg.text === '🎨 Открыть Mini App') {
      bot.sendMessage(msg.chat.id, 'Открываю генератор…', INLINE_OPEN);
      return;
    }
    if (msg.text === 'ℹ️ Помощь') {
      bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: 'Markdown', disable_web_page_preview: true });
      return;
    }
    if (msg.text === '🌱 Сиды дня') {
      const today = new Date().toDateString();
      const baseSeed = Math.abs(hashCode(today)) % 999999 + 1;
      const seeds = [baseSeed, baseSeed + 7, baseSeed + 42];
      const text = `🌱 *Сиды дня* (${today})\n\n` +
        seeds.map((s, i) => `${['🥇','🥈','🥉'][i]} \`${s}\``).join('\n') +
        `\n\nВведите эти числа в поле Seed в Mini App.`;
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown', ...INLINE_OPEN });
      return;
    }
    if (msg.text && !msg.text.startsWith('/')) {
      bot.sendMessage(msg.chat.id, 'Используйте кнопки внизу или команду /help 👇', MAIN_MENU);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('[bot] polling_error:', err.message);
  });

  console.log('[bot] Polling started. Откройте Telegram и напишите боту /start');
  console.log(`[bot] Mini App URL: ${WEBAPP_URL || '(не задан)'}\n`);
} else {
  console.log('[bot] Пропускаю запуск бота (нет токена).');
  console.log('[bot] Откройте http://localhost:' + PORT + '/ в браузере для теста Mini App.\n');
}

// ─────────────────────────────────────────────────────────────────────────────
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
    }
