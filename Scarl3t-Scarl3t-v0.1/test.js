const TelegramBot = require('node-telegram-bot-api');

// Вставьте свой токен бота Telegram
const token = '5995107016:AAH5kN7e_giF7xQYuYk41_tdyBcM8oLCTww';

// Создаем экземпляр бота
const bot = new TelegramBot(token, {polling: true});

// Обработчик новых сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Отправляем обратно полученное сообщение
  bot.sendMessage(chatId, chatId);
});
