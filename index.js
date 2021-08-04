const request = require('request');
require('dotenv').config();

const getAdsInfo = require('./utils/getAdsInfo');
const getPrices = require('./utils/getPrices');

const token = process.env.TOKEN;
const TelegramApi = require('node-telegram-bot-api');
const bot = new TelegramApi(token, {polling: true});

let dataStorage = ['0'];
let analyticsInitialData = [];

//const url = 'https://www.avito.ru/ufa/kvartiry/prodam-ASgBAgICAUSSA8YQ?cd=1&district=70';

const adsSender = (url, chatId) => {
    request({url, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'}}, async (error, response) => {
        if (error) {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/566/45f/56645f7f-a710-3ccf-9170-2916aff53e97/4.webp');
            await bot.sendMessage(chatId, 'Что-то работает не так как надо!');
        } else {
            //console.log(response);
            const result = getAdsInfo(response);
            console.log(result.length);

            //В случае неудачи при парсинге будет отправленно сообщение и стикер о том, что нужно попробовать еще раз
            if (result.length === 0) {
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/22c/b26/22cb267f-a2ab-41e4-8360-fe35ac048c3b/11.webp');
                await bot.sendMessage(chatId, 'Что-то пошло не так, возможно нас заблокировали. Подожди пару секунд и повтори попытку');
            } else {
                await result.forEach((elem) => {
                    let message = elem.apartmentTitles + '\n' + '\n' + elem.apartmentAdsUrl + '\n' + '\n' + elem.prices + '\n' + '\n' + elem.streatName + '\n' + '\n' + elem.districtName + '\n' + '\n' + elem.apartmentInfo + '\n' + '\n' + elem.dates;
                    bot.sendMessage(chatId, message);
                })
                setTimeout(() => {
                    return bot.sendMessage(chatId, 'Парсим следующую страницу?', nextPage);
                }, 10000);
            }
        }
    })
};

const analyticsSender = (url, chatId) => {
    request({url, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'}}, async (error, response) => {
        if (error) {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/566/45f/56645f7f-a710-3ccf-9170-2916aff53e97/4.webp');
            await bot.sendMessage(chatId, 'Что-то работает не так как надо!');
        } else {
            const result = response.body;
            await console.log(getPrices(result));
            await bot.sendMessage(chatId, result.length);
        }
    })
}

const districtSelector = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Демский', callback_data: '70'}, {text: 'Калининский', callback_data: '71'}, {text: 'Кировский', callback_data: '72'}],
            [{text: 'Ленинский', callback_data: '73'}, {text: 'Октябрьский', callback_data: '74'}, {text: 'Орджоникидзевский', callback_data: '75'}],
            [{text: 'Советсткий', callback_data: '76'}]
        ]
    })
};

const nextPage = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Страница 2', callback_data: '2'}, {text: 'Страница 3', callback_data: '3'}, {text: 'Страница 4', callback_data: '4'}],
            [{text: 'Страница 5', callback_data: '5'}, {text: 'Страница 6', callback_data: '6'}, {text: 'Страница 7', callback_data: '7'}],
            [{text: 'Страница 8', callback_data: '8'}, {text: 'Страница 9', callback_data: '9'}, {text: 'Страница 10', callback_data: '10'}]
        ]
    }))
};

const analyticsStart = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Поехали!', callback_data: 'analyticsRun'}]
        ]
    }))
};

const housingMarket = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Первичный рынок', callback_data: 'primaryMarket'}, {text: 'Вторичный рынок', callback_data: 'secondaryMarket'}]
        ]
    }))
};

const roomsNumber = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: '1 комната', callback_data: 'oneRoom'}, {text: '2 комнаты', callback_data: 'twoRooms'}, {text: '3 комнаты', callback_data: 'threeRooms'}],
            [{text: '4 комнаты', callback_data: 'fourRooms'}, {text: 'студия', callback_data: 'studii'}]
        ]
    }))
}



const start = () => {

    bot.setMyCommands([
        {
            command: '/start',
            description: 'Начало работы с ботом'
        },
        {
            command: '/info',
            description: 'Общая информация'
        },
        {
            command: '/parse_ads',
            description: 'Переход в режим парсинга'
        },
        {
            command: '/analytics',
            description: 'Переход в режим аналитики'
        }
    ]);

    bot.on('message', msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            return bot.sendMessage(chatId, 'Привет! Я бот по поиску объявлений о продаже квартир на сайте avito.ru. Информация об объявлениях берется с сайта посредством парсинга страниц');
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, 'Отправь мне комманду "/parse_ads" для перехода в режим парсинга страниц. Последующие страницы лучше открывать поочередно, иначе нас могут заблокировать');
        }

        if (text === '/parse_ads') {
            //getAds(url);
            console.log(dataStorage);
            dataStorage.length > 30 ? dataStorage = ['0'] : null;
            return bot.sendMessage(chatId, 'Режим парсинга включен! Выберите район города.', districtSelector);
        }

        if (text === '/analytics') {
            bot.sendMessage(chatId, 'Режим аналитики включен! Сейчас будет произведена оценка средней стоимости 1 кв.метра жилья.', analyticsStart);
        }
    });
};

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data > 10) {
        dataStorage[0] = data;
    } else if (data <= 10) {
        dataStorage.push(data);
    }

    if (data > 10) {
        let pageNumber = '1';
        let districtNumber = dataStorage[0];
        let url = `https://www.avito.ru/ufa/kvartiry/prodam-ASgBAgICAUSSA8YQ?cd=${pageNumber}&district=${districtNumber}`;
        adsSender(url, chatId);
    } else if (data <= 10) {
        let pageNumber = dataStorage[dataStorage.length - 1];
        let districtNumber = dataStorage[0];
        let url = `https://www.avito.ru/ufa/kvartiry/prodam-ASgBAgICAUSSA8YQ?cd=1&district=${districtNumber}&p=${pageNumber}`;
        adsSender(url, chatId);
    }


    //Работа модуля аналитики
    if (data === 'analyticsRun') {
        analyticsInitialData = [];
        await bot.sendMessage(chatId, 'Анализировать первичный или вторичный рынок жилья?', housingMarket);
    }
    if (data === 'primaryMarket') {
        analyticsInitialData.push('novostroyka');
        await bot.sendMessage(chatId, 'Скольки комнатные квартиры рассматривать?', roomsNumber);
    } else if (data === 'secondaryMarket') {
        analyticsInitialData.push('vtorichka');
        await bot.sendMessage(chatId, 'Скольки комнатные квартиры рассматривать?', roomsNumber);
    }

    switch (data) {
        case 'oneRoom':
            analyticsInitialData.push('1-komnatnye');
            analyticsInitialData.push('ASgBAQICAUSSA8YQAkDmBxSOUsoIFIBZ');
            break;
        case 'twoRooms':
            analyticsInitialData.push('2-komnatnye');
            analyticsInitialData.push('ASgBAQICAUSSA8YQAkDmBxSMUsoIFIJZ');
            break;
        case 'threeRooms':
            analyticsInitialData.push('3-komnatnye');
            analyticsInitialData.push('ASgBAQICAUSSA8YQAkDmBxSMUsoIFIRZ')
            break;
        case 'fourRooms':
            analyticsInitialData.push('4-komnatnye');
            analyticsInitialData.push('ASgBAQICAUSSA8YQAkDmBxSMUsoIFIZZ')
            break;
        case 'studii':
            analyticsInitialData.push('studii');
            analyticsInitialData.push('ASgBAQICAUSSA8YQAkDmBxSOUsoIFP5Y');
    }

    await console.log(analyticsInitialData);
    //await console.log(`https://www.avito.ru/ufa/kvartiry/prodam/${analyticsInitialData[1]}-komnatnye/${analyticsInitialData[0]}-ASgBAQICAUSSA8YQAkDmBxSOUsoIFIZZ?cd=`);
    if (analyticsInitialData.length === 3) {
        for (let count = 1; count <= 1; count++){
            (function (num) {
                setTimeout(function () {
                    let url = (`https://www.avito.ru/ufa/kvartiry/prodam/${analyticsInitialData[1]}/${analyticsInitialData[0]}-${analyticsInitialData[2]}?cd=` + count);
                    console.log(url);
                    analyticsSender(url, chatId);
                }, 3000 * num * (Math.floor(Math.random() * 10 + 1)))
            }(count, analyticsInitialData));
        }
    };

});

start();
