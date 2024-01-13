const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs');
const timeout = require('./timeout.json');

function savedbtimeout() {
  fs.writeFile('./timeout.json', JSON.stringify(timeout), (err) => {
    if (err) console.log(err);
  });
}

function timeRestoy(time) {
  let send = 0;

  let cheeeyear = time / (60 * 60 * 24 * 7 * 30 * 12);
  let year = Math.floor(cheeeyear);

  let cheeemonth = time / (60 * 60 * 24 * 7 * 30);
  let month = Math.floor(cheeemonth);

  let cheeeweek = time / (60 * 60 * 24 * 7);
  let week = Math.floor(cheeeweek);

  let cheeeday = time / (60 * 60 * 24);
  let day = Math.floor(cheeeday);

  let cheeehas = time / (60 * 60);
  let sendkolhas = cheeehas - Math.floor(cheeehas / 24) * 24;
  let hass = Math.floor(sendkolhas);

  let cheee = time / 60;
  let min = Math.floor(cheee);
  let sec = (cheee - min) * 60;
  sec = Math.abs(sec);
  sec = Math.floor(sec);
  let cheee2 = min / 60;

  let has = Math.floor(cheee2);
  min = (cheee2 - has) * 60;
  min = Math.floor(min);

  if (time < 60 * 60 * 24 * 7 * 30 * 12)
    send = `*${month};* мс.*${Math.floor(week - (month * 30) / 7)};* нд.`;
  if (time < 60 * 60 * 24 * 7 * 30)
    send = `*${week};* нд. *${Math.floor(day - week * 7)};* дн.`;
  if (time < 60 * 60 * 24 * 7) send = `*${day};* дн. *${hass};* час.`;
  if (time < 60 * 60 * 24) send = `*${has};* час. *${min};* мим.`;
  if (time < 60 * 60) send = `*${min};* мин. *${sec};* сек.`;
  if (time < 60) send = `*${sec};* сек.`;

  return send;
}

try {
	const bot = new TelegramBot(config.token, { polling: true });

	bot.on('message', async (msg) => {
		if (!timeout[msg.chat.id]) {
		timeout[msg.chat.id] = {
			timeout: 0
		};
		savedbtimeout();
		}

		if (msg.text) {
		var content = msg.text;
		var contentediting = content.substr(0, 1);
		if (contentediting === "/") {
			var command = config.command;
			var contentcommand = content.replace("/", "");
			if (!command.includes(contentcommand)) {
			if (
				msg.chat.type === 'supergroup' ||
				msg.chat.type === 'group'
			) {
				return;
			}
			const captionText = `*Привет!* 😊 Я бот *поддержки*, готовый *помочь тебе* в работе. Если у тебя возникли *вопросы* или *проблемы*, просто отправь мне *сообщение* в этот чат. Я *постараюсь* ответить как *можно скорее*.\n\nОбрати *внимание*, что у нас установлен *таймаут*, вы можете *отправлять* сообщения раз в *15 минут*. ⏰ Чтобы получить *максимально точный* и *полезный* ответ, пожалуйста, предоставь *максимум информации* о своей проблеме или вопросе.\n\n Чем *больше деталей* ты предоставишь, тем лучше *я смогу* помочь. Если требуется *предоставить* какие-либо *файлы* или *скриншоты*, не стесняйся *отправить* их вместе с сообщением. Я готов *помочь* тебе, так что *не стесняйся* обращаться! 😉`;
			await bot.sendMessage(
				msg.chat.id,
				`🤔 Я *не могу* найти команду ${content};`,
				{ parse_mode: "Markdown" }
			);
			await bot.sendPhoto(
				msg.chat.id,
				"https://media.discordapp.net/attachments/1088507989956231188/1114614330005131405/Frame_14.png?width=1440&height=555",
				{ caption: captionText, parse_mode: "Markdown" }
			);
			return;
			}
		}
		if (contentediting === "/") return;
		}
		try {
		if (msg.chat.type === 'private') {
			const comandtimes = Date.now() / 1000;
			const lerindtime = Math.floor(
			timeout[msg.chat.id].timeout - comandtimes
			);
			if (timeout[msg.chat.id].timeout - comandtimes > 0) {
			return await bot.sendMessage(
				msg.chat.id,
				`🙁 *К сожалению* следующий запрос Вы *сможете* отправить через ${timeRestoy(
				lerindtime
				)};`,
				{ parse_mode: "Markdown" }
			);
			}
			timeout[msg.chat.id].timeout = comandtimes;
			timeout[msg.chat.id].timeout += 15 * 60;
			savedbtimeout();
			const forwardedMsg = await bot.forwardMessage(
			config.groupId,
			msg.chat.id,
			msg.message_id
			);
			await bot.sendMessage(
			msg.chat.id,
			`😊 Ваш *запрос* был *успешно отправлен*, ожидайте!`,
			{
				parse_mode: "Markdown",
				reply_to_message_id: msg.message_id
			}
			);
			const ownerId = msg.from.id;

			await bot.sendMessage(
			forwardedMsg.chat.id,
			`❕ <b>Сообщение выше</b> прислал <a href="tg://user?id=${ownerId}">${ownerId}</a>`,
			{ parse_mode: "HTML", reply_to_message_id: forwardedMsg.message_id }
			);
		} else {
			const forwardedMsg = await bot.forwardMessage(
			config.groupId,
			msg.chat.id,
			msg.message_id
			);
			await bot.sendMessage(
			msg.chat.id,
			`😊 Ваш *запрос* был *успешно отправлен*, ожидайте!`,
			{
				parse_mode: "Markdown",
				reply_to_message_id: msg.message_id
			}
			);
			const ownerId = msg.from.id;

			await bot.sendMessage(
			forwardedMsg.chat.id,
			`❕ <b>Сообщение выше</b> прислал <a href="tg://user?id=${ownerId}">${ownerId}</a>`,
			{ parse_mode: "HTML", reply_to_message_id: forwardedMsg.message_id }
			);
		}
		} catch (e) {
		console.log(e);
		}
	});

	bot.onText(/\/start/, async (msg) => {
		if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') return bot.sendMessage(msg.chat.id, "⛔ *Ошибка*! Команды *работают* только в *ЛС*.", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
		const chatId = msg.chat.id;
		const username = msg.from.username;
		const dateAdded = Date.now();

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
		await bot.sendPhoto(chatId, "https://media.discordapp.net/attachments/1088507989956231188/1114614330005131405/Frame_14.png?width=1440&height=555", { caption: captionText, parse_mode: "Markdown", reply_markup: inlineKeyboard });
	
	});
	
	bot.onText(/\/m (.+)/, async (msg, match) => {
	try {
		if (msg.chat.id.toString() === config.groupId) {

		try {
			const targetId = match[1];
			const messageText = match[0].split(' ').slice(2).join(' ');

			if (messageText) {
			await bot.sendMessage(targetId, messageText);

			await bot.sendMessage(msg.chat.id, `🙂 Сообщение *успешно* отправлено!`, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
			} else {
			await bot.sendMessage(msg.chat.id, '⛔ *Ошибка*! Вы *не указали* текст сообщения', { parse_mode: "Markdown" });
			}
		} catch (error) {
			await bot.sendMessage(msg.chat.id, `Ошибка при отправке сообщения: ${error.message};`);
		}
		} else {
		await bot.sendMessage(msg.chat.id, '⛔ *Ошибка*! Эта команда *не доступна*', { parse_mode: "Markdown" });
		}
	} catch (error) {
		console.error('Ошибка при обработке команды:', error.message);
	}
	});
	
} catch (e) {
	console.log(e);
}
console.log(`\x1b[32m[START]\x1b[0m Приложение: \x1b[33mScarlet Support\x1b[0m, успешно подключенно к серверам Telegram`);