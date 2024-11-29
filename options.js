const axios = require('axios');
const cheerio = require('cheerio');
const currentDay = new Date().getDay() >= 5 ? 1 : new Date().getDay();

module.exports = {
  year: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '1 курс', callback_data: '1' }],
        [{ text: '2 курс', callback_data: '2' }],
        [{ text: '3 курс', callback_data: '3' }],
        [{ text: '4 курс', callback_data: '4' }],
      ],
    }),
  },
  dayOfWeek: ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'],
  getData: async () => {
    try {
      const { data } = await axios.get(
        `https://xn----3-iddzneycrmpn.xn--p1ai/lesson_table_show/?day=${currentDay}`,
      );
      return cheerio.load(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  currentDay: currentDay,
};
