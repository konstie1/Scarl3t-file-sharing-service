const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('./config.json');
const { exec } = require('child_process');
const files = require('../db/files.json');
const users = require('../db/users.json');
const { memoryUsage } = require('process');
const TelegramBot = require('node-telegram-bot-api');

// Сохранение БД
function savedbusers() {
    fs.writeFile(`./db/users.json`, JSON.stringify(users),(err)=>{if(err) console.log(err);});
}


function savedbfiles() {
    fs.writeFile(`./db/files.json`, JSON.stringify(files),(err)=>{if(err) console.log(err);});
}


function ifdbusers(chatId, username, dateAdded) {
    if(!users[chatId]){
        users[chatId] ={ 
            id:chatId,
            page:1,
            filespage:0,
            username:username,
            dateAdded:dateAdded,
            files:[],
            filescods:[],
            shared:[],
            status:"User",
            balance:0,
            transferhistory:[],
            fileshistory:[]
        }
        savedbusers();
    };
}


// Обработка кд
function convertUnixTimeToDateFormat(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `*${day}.${month}.${year} в ${hours}:${minutes}*`;
}

// Перевод байтов в мегабайты
function bytesToMegabytes(bytes) {
    const megabytes = bytes / (1024 * 1024);
    return megabytes.toFixed(2); // Округляем до двух знаков после запятой
}

// Генератор набора чисел вида XXXX-XXXX-XXXX-XXXX
function generatePassword() {
    let password = '';
  
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        password += '-';
      }
      password += Math.floor(Math.random() * 10);
    }
  
    return password;
}

// Генератор ID
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Инициализация бота
const bot = new TelegramBot(config.token, {polling: true});
// require('./observer.js')(bot);

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return bot.sendMessage(msg.chat.id, "⛔ *Ошибка*! Команды *работают* только в *ЛС*.", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const dateAdded = Date.now();
    
    // Проверка db

    // Отправка сообщений
    const inlineKeyboard = {
        inline_keyboard: [
            [
                {
                    text: '👋 Основное меню',
                    callback_data: 'backmenu',
                },
            ],
        ],
    };

    const captionText = `🚀 Давай начнем работу вместе!\n\n📝 Моя *основная функция* заключается в том, чтобы служить тебе в качестве *файлообменника* и надежного хранилища данных. Я готов хранить *твои файлы* и информацию в безопасности, *доступной тебе* в любое время.\n\n❕ Все ваши *файлы доступны только вам*, но Вы *можете* делиться ими с друзьями по *коду* или дaвать *доступ* через панель. Ограничения *по размеру* и *количеству* файлов *нет*.\n\n🛡 Я разработан *энтузиастами* и полностью конфиденциален, твоя безопасность для меня *наивысший* приоритет! Владельцам *Scarl3t* безразлично, какие данные ты *сохраняешь* у меня, если это *не мешает* моей работе.\n\n📥 Чтобы *сохранить* файл, просто *отправь* его мне, и я сохраню его *в безопасном месте*. Ты всегда сможешь *получить* к нему доступ, просто *обратившись* ко мне с соответствующим запросом. Я готов стать твоим надежным *помощником* в хранении и передачи твоих данных! \n\n*Основное меню*: /profile`;
    await bot.sendMessage(msg.chat.id, `👋 *Приветствую!*`, { parse_mode: 'Markdown' });
    await bot.sendPhoto(chatId, "https://media.discordapp.net/attachments/1088507989956231188/1113582608316633160/Frame_2.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard })
});

// Обработчик команды /profile
bot.onText(/\/profile/, async (msg) => {
    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return bot.sendMessage(msg.chat.id, "⛔ *Ошибка*! Команды *работают* только в *ЛС*.", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
    // const chatType = msg.chat.type;
    // if (chatType !== 'private') return  
    
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const dateAdded = Date.now();

    
    // Проверка db
    ifdbusers(chatId, username, dateAdded);

    const userId = users[chatId].id;
    const status = users[chatId].status;
    const sharedlength = (users[chatId].shared).length;
    const filescodslength = (users[chatId].filescods).length;

    // Отправка сообщений
    const inlineKeyboard = {
        inline_keyboard: [
            [
                {
                    text: '📄 Файлы',
                    callback_data: 'files',
                },
            ],
            [
                {
                    text: '⚙ Аккаунт',
                    callback_data: 'account',
                },
                {
                    text: '🆘 Поддержка',
                    callback_data: 'help',
                },
            ],
        ],
    };
    const captionText = `📰 Меню: *Основное меню бота*\nВыберите *необходимое* действие\n\n🤖 *Информация о Боте*:\n├ *Айди*: \`${config.id}\`\n├ *Версия*: \`${config.version}\`\n└ *Ссылка*: ${config.botlink}\n\n🔎 *Информация о Вас*:\n├ *Айди*: \`${userId}\`\n├ *Уровень*: \`${status}\`\n├ *Кол-во файлов*: ${filescodslength}\n└ *Кол-во доверенных файлов*: ${sharedlength}\n\n*Помощь по боту*: /help`;
    await bot.sendPhoto(msg.chat.id, "https://media.discordapp.net/attachments/1088507989956231188/1113582608643805236/Frame_3.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard })
});

// Обработка колбэков (нажатий на кнопки)
bot.on('callback_query', async (query) => {
    const buttonsnames = ["left", "delete", "ringth", "myfiles", "files", "backmenu", "help", "sendfile", "addremovefile", "accesslist", "regenerationkey", "deletefile"]
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    
    const username = query.from.username;
    const dateAdded = Date.now();
    
    if(!users[messageId]){
        users[messageId] ={ 
            page:1,
            filespage:0,
        }
        savedbusers();
    };

    ifdbusers(chatId, username, dateAdded);
    if(data === 'delete') {
        bot.deleteMessage(chatId, messageId)
    }
    if(data === 'sendfile') {
        ifdbusers(chatId, username, dateAdded);
        if(!files[users[messageId].filespage]) return;
        filepick = users[messageId].filespage;

        const inlineKeyboard = {
            inline_keyboard: [
              [
                {
                  text: '❌ Удалить',
                  callback_data: 'delete',
                },
              ],
            ],
        };
        
        if(files[filepick].type == "Видео") {
            const msg = files[file].groupIdFile;
            await bot.sendVideo(chatId, msg.video.file_id, { reply_to_message_id: messageId, reply_markup: inlineKeyboard })
        }

        if(files[filepick].type == "Изображение") {
            const msg = files[file].groupIdFile;
            const photo = msg.photo[msg.photo.length - 1];
        
            await bot.sendPhoto(chatId, photo.file_id, { reply_to_message_id: messageId, reply_markup: inlineKeyboard })
        }
          
        if(files[filepick].type == "Файл") {
            const msg = files[file].groupIdFile;
            bot.sendDocument(chatId, msg.document.file_id, { reply_to_message_id: messageId, reply_markup: inlineKeyboard })
        }
    }
    if(data === 'left') {
        var userfiles = users[chatId].filescods;
        ifdbusers(chatId, username, dateAdded);

        var text = "";
        var inline_keyboard = [[]];
        var mass = 0;
        page = users[messageId].page - 1;
        users[messageId].page = page;
        savedbusers();
        if(page <= 1) {
            users[messageId].page = 1;
            savedbusers();
            for(i=0; i < userfiles.length; i++) {
                if(i==6) {
                    break;
                };
                if (i % 3 === 0) {
                    mass++;
                    inline_keyboard.push([]);
                } 
                text += `\n\n*${i+1})* \`${files[userfiles[i]].name}\`\n├ *Тип*: ${files[userfiles[i]].type}\n├ *Размер*: \`${bytesToMegabytes(files[userfiles[i]].size)}Мб\`\n└ *Добавлено*: ${convertUnixTimeToDateFormat(files[userfiles[i]].dateAdded)}`
                inline_keyboard[mass].push({
                    text: `💾 Файл #${i+1}`,
                    callback_data: `${files[userfiles[i]].id}`,
                })
            }
            if(userfiles.length > 6) {
                inline_keyboard.push([
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    },
                    {
                        text: `${page}/${Math.ceil(userfiles.length/6)}`,
                        callback_data: 'pusto',
                    },
                    {
                        text: '➡',
                        callback_data: 'ringth',
                    }
                ])
            }
            if(userfiles.length <= 6) {
                inline_keyboard.push([
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    },
                    {
                        text: `${page}/${Math.ceil(userfiles.length/6)}`,
                        callback_data: 'pusto',
                    },
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    }
                ])
            }
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
        for (let i=(page-1)*6; i < userfiles.length; i++) {
            if (i==(((page-1)*6)+6)) {
                break;
            }
            if (i % 3 === 0) {
                mass++;
                inline_keyboard.push([]);
            } 
            text += `\n\n*${i+1})* \`${files[userfiles[i]].name}\`\n├ *Тип*: ${files[userfiles[i]].type}\n├ *Размер*: \`${bytesToMegabytes(files[userfiles[i]].size)}Мб\`\n└ *Добавлено*: ${convertUnixTimeToDateFormat(files[userfiles[i]].dateAdded)}`
            inline_keyboard[mass].push({
                text: `💾 Файл #${i+1}`,
                callback_data: `${files[userfiles[i]].id}`,
            })
        }   
        if(page == Math.ceil(userfiles.length/6)) {
            inline_keyboard.push([
                {
                    text: ' ',
                    callback_data: 'pusto',
                },
                {
                    text: `${page}/${Math.ceil(userfiles.length/6)}`,
                    callback_data: 'pusto',
                },
                {
                    text: '➡',
                    callback_data: 'ringth',
                }
            ])
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
        if(page !== Math.ceil(userfiles.length/6)) {
            inline_keyboard.push([
                {
                    text: '⬅',
                    callback_data: 'left',
                },
                {
                    text: `${page}/${Math.ceil(userfiles.length/6)}`,
                    callback_data: 'pusto',
                },
                {
                    text: '➡',
                    callback_data: 'ringth',
                }
            ])
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
    }
    if(data === 'ringth') {
        var userfiles = users[chatId].filescods;
        ifdbusers(chatId, username, dateAdded);
        page = users[messageId].page;

        if(page == 1) page++;
        if(page > Math.ceil(userfiles.length/6)) page = Math.ceil(userfiles.length/6);
        users[chatId].page = page;
        savedbusers();

        var text = "";
        var inline_keyboard = [[]];
        var mass = 0;
        for(let i=(page-1)*6; i < userfiles.length; i++) {
            if (i==((page-1)*6)+6) {
                break;
            }
            if (i % 3 === 0) {
                mass++;
                inline_keyboard.push([]);
            } 
            text += `\n\n*${i+1})* \`${files[userfiles[i]].name}\`\n├ *Тип*: ${files[userfiles[i]].type}\n├ *Размер*: \`${bytesToMegabytes(files[userfiles[i]].size)}Мб\`\n└ *Добавлено*: ${convertUnixTimeToDateFormat(files[userfiles[i]].dateAdded)}`
            inline_keyboard[mass].push({
                text: `💾 Файл #${i+1}`,
                callback_data: `${files[userfiles[i]].id}`,
            })
        }   
        if(userfiles.length <= 6) {
            inline_keyboard.push([
                {
                    text: ' ',
                    callback_data: 'pusto',
                },
                {
                    text: `${page}/${Math.ceil(userfiles.length/6)}`,
                    callback_data: 'pusto',
                },
                {
                    text: ' ',
                    callback_data: 'pusto',
                }
            ])

            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
        if(page == Math.ceil(userfiles.length/6)) {
            inline_keyboard.push([
                {
                    text: '⬅',
                    callback_data: 'left',
                },
                {
                    text: `${page}/${Math.ceil(userfiles.length/6)}`,
                    callback_data: 'pusto',
                },
                {
                    text: ' ',
                    callback_data: 'pusto',
                }
            ])
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
        if(page !== Math.ceil(userfiles.length/6)) {
            inline_keyboard.push([
                {
                    text: '⬅',
                    callback_data: 'left',
                },
                {
                    text: `${page}/${Math.ceil(userfiles.length/6)}`,
                    callback_data: 'pusto',
                },
                {
                    text: '➡',
                    callback_data: 'ringth',
                }
            ])
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
            return;
        }
    }
    if(data === 'myfiles') {
        var userfiles = users[chatId].filescods;
        ifdbusers(chatId, username, dateAdded);

        users[messageId].page;
        users[messageId].page = 1;
        savedbusers();

        page = 1

        if(userfiles.length > 0) {
            var text = "";
            var inline_keyboard = [[]];
            var mass = 0;
            for(i=0; i < userfiles.length; i++) {
                if(i==6) {
                    break;
                };
                if (i % 3 === 0) {
                    mass++;
                    inline_keyboard.push([]);
                } 
                text += `\n\n*${i+1})* \`${files[userfiles[i]].name}\`\n├ *Тип*: ${files[userfiles[i]].type}\n├ *Размер*: \`${bytesToMegabytes(files[userfiles[i]].size)}Мб\`\n└ *Добавлено*: ${convertUnixTimeToDateFormat(files[userfiles[i]].dateAdded)}`
                inline_keyboard[mass].push({
                    text: `💾 Файл #${i+1}`,
                    callback_data: `${files[userfiles[i]].id}`,
                })
            }
            if(userfiles.length > 6) {
                inline_keyboard.push([
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    },
                    {
                        text: `${page}/${Math.ceil(userfiles.length/6)}`,
                        callback_data: 'pusto',
                    },
                    {
                        text: '➡',
                        callback_data: 'ringth',
                    }
                ])
            }
            if(userfiles.length <= 6) {
                inline_keyboard.push([
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    },
                    {
                        text: `${page}/${Math.ceil(userfiles.length/6)}`,
                        callback_data: 'pusto',
                    },
                    {
                        text: ' ',
                        callback_data: 'pusto',
                    }
                ])
            }
            inline_keyboard.push([{
                text: '⬅ Назад',
                callback_data: 'files',
            }])
            const inlineKeyboard = {inline_keyboard}
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Список всех ваших файлов*\nВыберите *необходимый* файл из *${userfiles.length}* шт.${text}`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
        }

        if(userfiles.length == 0) {
            // Отправка сообщений
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Назад',
                            callback_data: 'files',
                        },
                    ],
                ],
            };
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Ошибка*\n\n📋 Суть: Список *ваших* файлов пуст.\nДля *сохраниения* файла в боте отправте его в чат.\n\n*Помощь по боту*: /help`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
        }
    }
    if(data === 'files') {
        ifdbusers(chatId, username, dateAdded);
        const filescodslength = (users[chatId].filescods).length;
        const sharedlength = (users[chatId].shared).length;

        const inlineKeyboard = {
            inline_keyboard: [
                [
                    {
                    text: `📄 Мои файлы - ${(users[chatId].filescods).length}`,
                    callback_data: 'myfiles',
                    },
                    {
                    text: `🤝 Доступные файлы - ${(users[chatId].shared).length}`,
                    callback_data: 'sharedfiles',
                    },
                ],
                [
                    {
                        text: '🔑 Использовать ключ',
                        callback_data: 'key',
                    },
                ],
                [
                    {
                        text: '⬅ Назад',
                        callback_data: 'backmenu',
                    },
                ]
            ],
        };
        const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
        const captionText = `📰 Меню: *Управление и доступ к файлам*\nВыберите *необходимый* раздел и/или действие\n\n💾 *Файлы*:\n├ *Кол-во файлов*: ${filescodslength}\n└ *Кол-во доверенных файлов*: ${sharedlength}\n\n*Помощь по боту*: /help`;
        await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
        await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard, });
    }
    if(data === 'backmenu') {
        ifdbusers(chatId, username, dateAdded);
        const status = users[chatId].status;
        const userId = users[chatId].id;
        const filescodslength = (users[chatId].filescods).length;
        const sharedlength = (users[chatId].shared).length;
    
        // Отправка сообщений
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '📄 Файлы',
                        callback_data: 'files',
                    },
                ],
                [
                    {
                        text: '⚙ Аккаунт',
                        callback_data: 'account',
                    },
                    {
                        text: '🆘 Поддержка',
                        callback_data: 'help',
                    },
                ],
            ],
        };

        const mediaPhoto = `https://media.discordapp.net/attachments/1088507989956231188/1113582608643805236/Frame_3.png?width=1440&height=555`;
        const captionText = `📰 Меню: *Основное меню бота*\nВыберите *необходимое* действие\n\n🤖 *Информация о Боте*:\n├ *Айди*: \`${config.id}\`\n├ *Версия*: \`${config.version}\`\n└ *Ссылка*: ${config.botlink}\n\n🔎 *Информация о Вас*:\n├ *Айди*: \`${userId}\`\n├ *Уровень*: \`${status}\`\n├ *Кол-во файлов*: ${filescodslength}\n└ *Кол-во доверенных файлов*: ${sharedlength}\n\n*Помощь по боту*: /help`;
        await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
        await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard });
    }
    if(data === 'help') {
        ifdbusers(chatId, username, dateAdded);
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🛡 Поддержка',
                        url: 'https://t.me/Scarl3t_support_bot',
                    },
                    {
                        text: '⬅ Назад',
                        callback_data: 'backmenu',
                    },
                ],
            ],
        };
        const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303374409918/Frame_5.png?width=1440&height=555";
        const captionText = `📰 Меню: *Поддержка*\n\n⁉ Если у Вас *возникла проблема*, *вопрос* или *предложение*, обратитесь в нашу службу *поддержки*, для перехода *нажмите* на кнопку *"🛡 Поддержка"* ниже, информацию Вы *получите* прописав команду /start.`;
        await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
        await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard });
    }
    if(!buttonsnames.includes(data)) {
        ifdbusers(chatId, username, dateAdded);
        if(files[data]) {
            file = data;
            users[messageId].filespage = data;
            users[chatId].filespage = data;
            savedbusers();
            // Отправка сообщений
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        {
                            text: '✉ Отправить файл в чат',
                            callback_data: 'sendfile',
                        },
                    ],
                    [
                        {
                            text: '🛡 Выдать / Снять доступ',
                            callback_data: 'addremovefile',
                        },
                        {
                            text: '📊 Список людей с доступом',
                            callback_data: 'accesslist',
                        },
                    ],
                    [
                        {
                            text: '🔑 Регенерация ключа',
                            callback_data: 'regenerationkey',
                        },
                        {
                            text: '🗑 Удалить файл',
                            callback_data: 'deletefile',
                        },
                    ],
                    [
                        {
                            text: '⬅ Назад',
                            callback_data: 'myfiles',
                        },
                    ],
                ],
            };
            const mediaPhoto = "https://media.discordapp.net/attachments/1088507989956231188/1113903303613497344/Frame_6.png?width=1440&height=555";
            const captionText = `📰 Меню: *Действие с файлом*\n\n💾 *Полная информация*:\n├ *Название*: \`${files[file].name}\`\n├ *Тип*: ${files[file].type}\n├ *Ключ*: \`${files[file].code}\`\n├ *Размер*: \`${bytesToMegabytes(files[file].size)}Мб\`\n├ *Добавлено*: ${convertUnixTimeToDateFormat(files[file].dateAdded)}\n└ *Имеют доступ*: *${(files[file].access).length}*`;
            await bot.editMessageMedia({ type: "photo", media: mediaPhoto }, { chat_id: chatId, message_id: messageId });
            await bot.editMessageCaption(captionText, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: inlineKeyboard });
        }
    }
});

// Обработчик файлов
bot.on('document', async (msg) => {
    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return;
    const chatId = msg.chat.id;
    const dateAdded = Date.now();
    const username = msg.from.username;
    const fileSize = msg.document.file_size;
    const fileName = msg.document.file_name;
    savedbusers();
    savedbfiles();

    // Отослать файл
    const fileId = msg.document.file_id;
    await bot.sendDocument(config.groupID, fileId)
    .then((message) => {
        const MessageFileId = message.message_id; // Id сообщение в группе с этим файлом
        if(MessageFileId) {
            // Проверка db
            ifdbusers(chatId, username, dateAdded);
            const inlineKeyboard = {
                inline_keyboard: [
                  [
                    {
                      text: '📄 Файлы',
                      callback_data: 'files',
                    },
                  ],
                ],
            };
            const codePassword = generatePassword();
            const NumberFile = makeid(16);
            files[codePassword] = {
                fileid:NumberFile,
                code:codePassword,
                dateAdded:Date.now(),
                userid:chatId,
                memberused:[],
            }
            files[NumberFile] = {
                id:NumberFile,
                name:fileName,
                type:"Файл",
                size:fileSize,
                code:codePassword,
                userid:chatId,
                groupIdFile:message,
                access:[],
                dateAdded:Date.now()
            }
            var usersfilescods = users[chatId].filescods
            usersfilescods.push(NumberFile)
            savedbusers();
            savedbfiles();
        
            const captionText = `❕ Файл *"${fileName}"* был *успешно* добавлен в вашу библиотеку, для действий с ним *воспользуйтесь* меню *"Файлы"*.\n\n💿 *Информация о файле*:\n├ *Название*: \`${fileName}\`\n├ *Ключ*: \`${codePassword}\`\n├ *Тип*: *Файл*\n└ *Вес*: \`${bytesToMegabytes(fileSize)}Мб\``;
            bot.sendPhoto(msg.chat.id, "https://media.discordapp.net/attachments/1088507989956231188/1113811713943425024/Frame_8.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard, reply_markup: inlineKeyboard, reply_to_message_id: msg.message_id })
        }
    })
    .catch((error) => {
        console.error('Ошибка при отправке документа:', error);
    });
});

// Обработчик сообщений
bot.on('message', async (msg) => {
    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return;

    const chatId = msg.chat.id;
    const dateAdded = Date.now();
    const username = msg.from.username;
    ifdbusers(chatId, username, dateAdded);
    if (msg.photo) {
        // Получаем информацию о фото
        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;
        const fileSize = photo.file_size;
        const fileName = `Изображение ${(users[chatId].filescods).length}`;
        savedbusers();
        savedbfiles();
    
        // Отослать файл
        await bot.sendPhoto(config.groupID, fileId)
        .then((message) => {
            const MessageFileId = message.message_id; // Id сообщение в группе с этим файлом
            if(MessageFileId) {
                // Проверка db
                ifdbusers(chatId, username, dateAdded);
                
                const inlineKeyboard = {
                    inline_keyboard: [
                      [
                        {
                          text: '📄 Файлы',
                          callback_data: 'files',
                        },
                      ],
                    ],
                };
                const codePassword = generatePassword();
                const NumberFile = makeid(16);
                files[codePassword] = {
                    fileid:NumberFile,
                    code:codePassword,
                    dateAdded:Date.now(),
                    userid:chatId,
                    memberused:[],
                }
                files[NumberFile] = {
                    id:NumberFile,
                    name:fileName,
                    type:"Изображение",
                    size:fileSize,
                    code:codePassword,
                    userid:chatId,
                    groupIdFile:message,
                    access:[],
                    dateAdded:Date.now()
                }
                var usersfilescods = users[chatId].filescods
                usersfilescods.push(NumberFile)
                savedbusers();
                savedbfiles();
            
                const captionText = `❕ Изображение *"${fileName}"* был *успешно* добавлен в вашу библиотеку, для действий с ним *воспользуйтесь* меню *"Файлы"*.\n\n💿 *Информация о файле*:\n├ *Название*: \`${fileName}\`\n├ *Ключ*: \`${codePassword}\`\n├ *Тип*: *Изображение*\n└ *Вес*: \`${bytesToMegabytes(fileSize)}Мб\``;                
                bot.sendPhoto(chatId, "https://media.discordapp.net/attachments/1088507989956231188/1113811713943425024/Frame_8.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard, reply_markup: inlineKeyboard, reply_to_message_id: msg.message_id })
            }
        })
        .catch((error) => {
            console.error('Ошибка при отправке документа:', error);
        });
    }
    if (msg.video) {
        // Получаем информацию о фото
        const video = msg.video;
        const fileId = video.file_id;
        const fileSize = video.file_size;
        const fileName = video.file_name;
        savedbusers();
        savedbfiles();
    
        // Отослать файл
        await bot.sendVideo(config.groupID, fileId)
        .then(async (message) => {
            const MessageFileId = message.message_id; // Id сообщение в группе с этим файлом
            if(MessageFileId) {
                // Проверка db
                ifdbusers(chatId, username, dateAdded);
                
                const inlineKeyboard = {
                    inline_keyboard: [
                      [
                        {
                          text: '📄 Файлы',
                          callback_data: 'files',
                        },
                      ],
                    ],
                };
                const codePassword = generatePassword();
                const NumberFile = makeid(16);
                files[codePassword] = {
                    fileid:NumberFile,
                    code:codePassword,
                    dateAdded:Date.now(),
                    userid:chatId,
                    memberused:[],
                }
                files[NumberFile] = {
                    id:NumberFile,
                    name:fileName,
                    type:"Видео",
                    size:fileSize,
                    code:codePassword,
                    userid:chatId,
                    groupIdFile:message,
                    access:[],
                    dateAdded:Date.now()
                }
                var usersfilescods = users[chatId].filescods
                usersfilescods.push(NumberFile)
                savedbusers();
                savedbfiles();
                const captionText = `❕ Видео *"${fileName}"* был *успешно* добавлен в вашу библиотеку, для действий с ним *воспользуйтесь* меню *"Файлы"*.\n\n💿 *Информация о файле*:\n├ *Название*: \`${fileName}\`\n├ *Ключ*: \`${codePassword}\`\n├ *Тип*: *Видео*\n└ *Вес*: \`${bytesToMegabytes(fileSize)}Мб\``;
                bot.sendPhoto(msg.chat.id, "https://media.discordapp.net/attachments/1088507989956231188/1113811713943425024/Frame_8.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard, reply_markup: inlineKeyboard, reply_to_message_id: msg.message_id })
            }
        })
        .catch((error) => {
            console.error('Ошибка при отправке документа:', error);
        });
    }
    if (msg.text) {
        // Проверка на команду
        var content = msg.text;
        var contentediting = content.substr(0, 1);
        if(contentediting !== "/") return;

        // Проверка на наличие команды в боте 
        var command = config.command
        var contentcommand = content.replace("/", "");
        if(command.includes(contentcommand)) return;
    
        // Ошибка
        const captionText = `🚀 Давай начнем работу вместе!\n\n📝 Моя *основная функция* заключается в том, чтобы служить тебе в качестве *файлообменника* и надежного хранилища данных. Я готов хранить *твои файлы* и информацию в безопасности, *доступной тебе* в любое время.\n\n❕ Все ваши *файлы доступны только вам*, но Вы *можете* делиться ими с друзьями по *коду* или дaвать *доступ* через панель. Ограничения *по размеру* и *количеству* файлов *нет*.\n\n🛡 Я разработан *энтузиастами* и полностью конфиденциален, твоя безопасность для меня *наивысший* приоритет! Владельцам *Scarl3t* безразлично, какие данные ты *сохраняешь* у меня, если это *не мешает* моей работе.\n\n📥 Чтобы *сохранить* файл, просто *отправь* его мне, и я сохраню его *в безопасном месте*. Ты всегда сможешь *получить* к нему доступ, просто *обратившись* ко мне с соответствующим запросом. Я готов стать твоим надежным *помощником* в хранении и передачи твоих данных! \n\n*Основное меню*: /profile`;
        await bot.sendMessage(msg.chat.id, `🤔 Я *не могу* найти команду ${content}`, { parse_mode: "Markdown" });
        await bot.sendPhoto(msg.chat.id, "https://media.discordapp.net/attachments/1088507989956231188/1113582608316633160/Frame_2.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown" })
    }  
});

// Обработчик события добавления пользователя в чат
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    // msg.new_chat_member.id
    // Проверяем идентификатор группы
    if (chatId.toString() === config.groupID_MVP) {
        ifdbusers();
        if(users[msg.new_chat_member.id].status == "User") {
            users[msg.new_chat_member.id].status = "MVP";
            savedbusers();
        }
        const mention = `[@${msg.new_chat_member.first_name}](tg://user?id=${msg.new_chat_member.id})`;
        bot.sendMessage(chatId, `👋 *Привет*, ${mention}! Добро *пожаловать* к нам!`, { parse_mode: "Markdown" });
    }
});

// Запуск бота
bot.on('polling_error', (error) => {
    console.error('Ошибка в работе бота:', error);
});