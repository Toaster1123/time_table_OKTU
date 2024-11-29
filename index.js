const TelegramApi = require('node-telegram-bot-api');
const { year, dayOfWeek, getData, currentDay } = require('./options');

const token = '7755027930:AAG4HnATGD7KIKc5U59581gGpT5-KjaLE9g';

const bot = new TelegramApi(token, { polling: true });

let yearCount = 1;

let groupName = '';

let groupOptions = {
  reply_markup: {},
};

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
        for (let i = 1; i < 9; i++) {
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
    const $ = await getData();
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      return bot.sendMessage(chatId, 'Привет! Выбери свой курс:', year);
    }
    if (text === '/data_send') {
      return setDataByGroup(groupName, chatId, $);
    }
    if (text === '/change_group') {
      return bot.sendMessage(chatId, 'Выбери свой курс:', year);
    }
    return bot.sendMessage(chatId, 'Извините, я не понимаю такие слова');
  });
  bot.on('callback_query', async (msg) => {
    const $ = await getData();

    const chatId = msg.message.chat.id;

    const text = msg.message.text;
    if (text.includes('Выбери свой курс:')) {
      yearCount = msg.data;
      if (Object.keys(groupOptions) !== 0) {
        groupOptions = {
          reply_markup: {},
        };
      }
      await chooseGroup(yearCount, $);
      return await bot.sendMessage(chatId, 'Выбери свою группу:', groupOptions);
    } else {
      groupName = msg.data;
      return setDataByGroup(groupName, chatId, $);
    }
  });
};
start();
