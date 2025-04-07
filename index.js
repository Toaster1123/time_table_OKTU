const TelegramApi = require('node-telegram-bot-api');

const { year, dayOfWeek, getData, currentDay } = require('./options');
const { token } = require('./config');

const bot = new TelegramApi(token, { polling: true });

let yearCount = 1;

let groupName = '';

let groupOptions = {
  reply_markup: {},
};
let messageArray = [];

const chooseGroup = async (paramGroup, $) => {
  let count = 0;
  for (let i = 43; i >= 17; i--) {
    const groupName = $(`#g${i} > b`).text();
    const yearByGroupName = Number(groupName.substring(groupName.length - 5, groupName.length - 4));
    if (groupName != '' && yearByGroupName == paramGroup) {
      groupOptions.reply_markup.inline_keyboard = groupOptions.reply_markup.inline_keyboard || [];
      const index = Math.floor(count / 3);
      if (count % 3 === 0) {
        groupOptions.reply_markup.inline_keyboard.push([
          { text: groupName, callback_data: groupName },
        ]);
      } else {
        groupOptions.reply_markup.inline_keyboard[index].push({
          text: groupName,
          callback_data: groupName,
        });
      }
      count++;
    }
  }
};
const setDataByGroup = async (group, chatId, $) => {
  if (group != '') {
    for (let i = 43; i >= 17; i--) {
      if ($(`#g${i}`).text() == group) {
        const groupId = '#g' + i;
        await bot.sendMessage(
          chatId,
          `Расписание группы ${group} на ${dayOfWeek[currentDay - 1]}: `,
        );
        let message = '';
        const counter = currentDay == 1 ? 10 : 9;
        for (let i = 1; i < counter; i++) {
          const tableData = $(groupId + '_' + i)
            .text()
            .trim();
          if (tableData !== '') {
            message += tableData + '\n' + '\n';
          }
        }

        return bot.sendMessage(chatId, message);
      }
    }
  } else {
    bot.sendMessage(chatId, 'Вы ещё не выбрали группу');
  }
};

const start = () => {
  bot.setMyCommands([
    { command: '/data_send', description: 'Получить данные о расписании' },
    { command: '/change_group', description: 'Поменять группу' },
  ]);
  bot.on('message', async (msg) => {
    console.log(msg);

    const $ = await getData();
    const text = msg.text;
    const chatId = msg.chat.id;
    messageArray.push(msg.message_id);
    console.log(messageArray);

    if (text === '/start') {
      await bot.sendMessage(chatId, 'Привет! Выбери свой курс:', year);

      messageArray.shift();
      return bot.deleteMessage(chatId, msg.message_id);
    }
    if (text === '/data_send') {
      await setDataByGroup(groupName, chatId, $);
      messageArray.shift();
      return bot.deleteMessage(chatId, msg.message_id);
    }
    if (text === '/change_group') {
      await bot.sendMessage(chatId, 'Выбери свой курс:', year);
      return bot.deleteMessage(chatId, msg.message_id);
    }
    return bot.sendMessage(chatId, 'Извините, я не понимаю такие слова');
  });
  bot.on('callback_query', async (msg) => {
    console.log(msg);
    const $ = await getData();
    const chatId = msg.message.chat.id;
    const text = msg.message.text;

    messageArray.push(msg.message.message_id);
    console.log(messageArray);

    if (text.includes('Выбери свой курс:')) {
      yearCount = msg.data;
      if (Object.keys(groupOptions) !== 0) {
        groupOptions = {
          reply_markup: {},
        };
      }

      await chooseGroup(yearCount, $);
      await bot.sendMessage(chatId, 'Выбери свою группу:', groupOptions);

      messageArray.shift();
      return bot.deleteMessage(chatId, msg.message.message_id);
    }
    if (text == 'Выбери свою группу:') {
      groupName = msg.data;
      await setDataByGroup(groupName, chatId, $);
      messageArray.shift();
      return bot.deleteMessage(chatId, msg.message.message_id);
    }
    return bot.sendMessage(chatId, 'Не удалось выполнить комманду( Попробуйте ещё раз');
  });
};
start();
