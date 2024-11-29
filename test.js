const axios = require('axios');
const cheerio = require('cheerio');
const TelegramApi = require('node-telegram-bot-api');

const token = '7755027930:AAG4HnATGD7KIKc5U59581gGpT5-KjaLE9g';

const bot = new TelegramApi(token, { polling: true });

const getData = async () => {
  try {
    const { data } = await axios.get(
      'https://xn----3-iddzneycrmpn.xn--p1ai/lesson_table_show/?day=5',
    );
    return cheerio.load(data);
  } catch (error) {
    console.error(error);
  }
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Запустить бота' },
    { command: '/data_send', description: 'Получить данные о расписании' },
    { command: '/change_group', description: 'Поченять группу' },
  ]);
  bot.on('message', async (msg) => {
    const $ = await getData();

    const text = msg.text;

    const chatId = msg.chat.id;

    let $groups = [];

    const groupOptions = {
      reply_markup: {},
    };

    for (let i = 43; i >= 17; i--) {
      const groupName = $(`#g${i} > b`).text();
      let count = 1;
      if (groupName != '') {
        $groups.push(groupName);
      }
      count++;
    }

    let count = 0;
    $groups.forEach((groupName) => {
      groupOptions.reply_markup.inline_keyboard = groupOptions.reply_markup.inline_keyboard || [];
      const index = Math.floor(count / 3);
      if (count % 3 === 0) {
        groupOptions.reply_markup.inline_keyboard.push([
          { text: groupName, callback_data: groupName },
        ]);
      } else {
        groupOptions.reply_markup.inline_keyboard = groupOptions.reply_markup.inline_keyboard || [];
        groupOptions.reply_markup.inline_keyboard[index].push({
          text: groupName,
          callback_data: groupName,
        });
      }
      count++;
    });

    console.log(JSON.stringify(groupOptions.reply_markup)); // Вывод для проверки

    bot.sendMessage(chatId, 'Выберите группу:', groupOptions);
    if (text === '/start') {
      await bot.sendMessage(chatId, 'Привет! Выбери свою группу:');
      console.log(groupOptions);
    }
    if (text === '/data_send') {
      const $a = $('#g26 > b').text();
      bot.sendMessage(chatId, `Расписание группы ${$a} на пятницу: `);
      let message = '';
      for (let i = 1; i < 9; i++) {
        const tableData = $('#g26_' + i)
          .text()
          .trim();
        if (tableData !== '') {
          message += tableData + '\n' + '\n';
        }
      }

      return bot.sendMessage(chatId, message);
    }
  });
};
start();
