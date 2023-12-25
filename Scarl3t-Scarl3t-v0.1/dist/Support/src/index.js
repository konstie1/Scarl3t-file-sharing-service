const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');

(async () => {
  try {
    // Создание экземпляра бота
    const bot = new TelegramBot(config.token, { polling: true });

    // Обработчик новых сообщений
    bot.on('message', async (msg) => {
      
      if (msg.text) {
        // Проверка на команду
        var content = msg.text;
        var contentediting = content.substr(0, 1);
        if(contentediting == "/") {
          // Проверка на наличие команды в боте 
          var command = config.command
          var contentcommand = content.replace("/", "");
          if(!command.includes(contentcommand)) {
            // Ошибка
            if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return;
            const captionText = `*Привет!* 😊 Я бот *поддержки*, готовый *помочь тебе* в работе. Если у тебя возникли *вопросы* или *проблемы*, просто отправь мне *сообщение* в этот чат. Я *постараюсь* ответить как *можно скорее*.\n\nОбрати *внимание*, что у нас установлен *таймаут*, вы можете *отправлять* сообщения раз в *15 минут*. ⏰ Чтобы получить *максимально точный* и *полезный* ответ, пожалуйста, предоставь *максимум информации* о своей проблеме или вопросе.\n\n Чем *больше деталей* ты предоставишь, тем лучше *я смогу* помочь. Если требуется *предоставить* какие-либо *файлы* или *скриншоты*, не стесняйся *отправить* их вместе с сообщением. Я готов *помочь* тебе, так что *не стесняйся* обращаться! 😉`;
            await bot.sendMessage(msg.chat.id, `🤔 Я *не могу* найти команду ${content}`, { parse_mode: "Markdown" });
            await bot.sendPhoto(msg.chat.id, "https://media.discordapp.net/attachments/1088507989956231188/1114614330005131405/Frame_14.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown" })
            return;
          };
        }
        if(contentediting == "/") return;
      }  
      try {
        // Проверка, является ли сообщение из ЛС
        if (msg.chat.type === 'private') {
          // Пересылка сообщения в группу
          const forwardedMsg = await bot.forwardMessage(config.groupId, msg.chat.id, msg.message_id);

          // Получение ID владельца пересланного сообщения
          const ownerId = msg.from.id;

          // Отправка ответа на пересланное сообщение с указанием ID владельца
          await bot.sendMessage(forwardedMsg.chat.id, `❕ <b>Сообщение выше</b> прислал <a href="tg://user?id=${ownerId}">${ownerId}</a>.\n🤖 <b>Команда</b>: <code>\/m ${ownerId}</code>`, { parse_mode: 'HTML', reply_to_message_id: forwardedMsg.message_id });
        }
      } catch (error) {
        console.error('Ошибка при обработке сообщения:', error.message);
      }
    });

    // Обработчик команды /start
    bot.onText(/\/start/, async (msg) => {
        if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return bot.sendMessage(msg.chat.id, "⛔ *Ошибка*! Команды *работают* только в *ЛС*.", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
        const chatId = msg.chat.id;
        const username = msg.from.username;
        const dateAdded = Date.now();

        // Отправка сообщений
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🤖 Основной бот',
                        url: 'https://t.me/Scarl3t_bot',
                    },
                ],
            ],
        };
        const captionText = `*Привет!* 😊 Я бот *поддержки*, готовый *помочь тебе* в работе. Если у тебя возникли *вопросы* или *проблемы*, просто отправь мне *сообщение* в этот чат. Я *постараюсь* ответить как *можно скорее*.\n\nОбрати *внимание*, что у нас установлен *таймаут*, вы можете *отправлять* сообщения раз в *15 минут*. ⏰ Чтобы получить *максимально точный* и *полезный* ответ, пожалуйста, предоставь *максимум информации* о своей проблеме или вопросе.\n\n Чем *больше деталей* ты предоставишь, тем лучше *я смогу* помочь. Если требуется *предоставить* какие-либо *файлы* или *скриншоты*, не стесняйся *отправить* их вместе с сообщением. Я готов *помочь* тебе, так что *не стесняйся* обращаться! 😉`;
        await bot.sendMessage(msg.chat.id, `👋 *Приветствую!*`, { parse_mode: 'Markdown' });
        await bot.sendPhoto(chatId, "https://media.discordapp.net/attachments/1088507989956231188/1114614330005131405/Frame_14.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard })
    });
    
    // Обработчик новых сообщений
    bot.onText(/\/m (.+)/, async (msg, match) => {
      try {
        // Проверка, является ли сообщение из группы config.groupId
        if (msg.chat.id.toString() === config.groupId) {
          try {
            const targetId = match[1]; // Получение ID получателя из аргументов команды
            const messageText = match[0].split(' ').slice(2).join(' '); // Получение текста сообщения из аргументов команды

            if (messageText) {
              // Отправка сообщения по указанному ID
              await bot.sendMessage(targetId, messageText);

              // Уведомление об успешной отправке сообщения
              await bot.deleteMessage(msg.chat.id, msg.message_id)
              await bot.sendMessage(msg.chat.id, `Сообщение успешно отправлено по ID: ${targetId}`);
            } else {
              // В случае отсутствия текста сообщения
              await bot.sendMessage(msg.chat.id, '⛔ *Ошибка*! Вы *не указали* текст сообщения.');
            }
          } catch (error) {
            // В случае ошибки при отправке сообщения, выводим ошибку в чат
            await bot.sendMessage(msg.chat.id, `Ошибка при отправке сообщения: ${error.message}`);
          }
        } else {
          // Ответ в случае команды, вызванной в неправильном чате
          await bot.sendMessage(msg.chat.id, 'Эта команда доступна только в определенной группе.');
        }
      } catch (error) {
        console.error('Ошибка при обработке команды:', error.message);
      }
    });
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
  
})();    