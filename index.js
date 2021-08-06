const request = require('request');
require('dotenv').config();

const getAdsInfo = require('./parserUtils/getAdsInfo');
const getPrices = require('./parserUtils/getPrices');
const nextPage = require('./buttons/nextPage');
const districtSelector = require('./buttons/districtSelector');
const analyticsStart = require('./buttons/analyticsStart');
const housingMarket = require('./buttons/housingMarket');
const roomsNumber = require('./buttons/roomsNumber');




const token = process.env.TOKEN;
const TelegramApi = require('node-telegram-bot-api');
const bot = new TelegramApi(token, {polling: true});

let dataStorage = ['0'];
let analyticsInitialData = [];
var averagePricesList = [];
let purifiedAveragePriceList = [];
let sum = 0;

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
            await bot.sendMessage(chatId, 'Что-то работает не так как надо! Подожди пару минут и попробуй еще раз!');
        } else {
            const result = response.body;
            averagePricesList.push(getPrices(result));

            if (averagePricesList.includes('We are blocked!')) {
                await bot.sendMessage(chatId, 'Нас заблокировали!');
            }

            await console.log(averagePricesList);

            if (averagePricesList.length === 10) {
                averagePricesList.forEach((elem) => !isNaN(elem) ? purifiedAveragePriceList.push(elem) : null)

                purifiedAveragePriceList.forEach((elem) => {
                    sum += elem;
                });

                await bot.sendMessage(chatId, `Анализ информации закончен! Было рассмотренно ${purifiedAveragePriceList.length * 59} объявлений. Стоимость 1 кв метра в выбранным вами типе жилья составляет ${String(Math.floor(sum / purifiedAveragePriceList.length))}`);
            }
        }
    })
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

    if (analyticsInitialData.length === 3) {

        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/f87/928/f8792879-6d47-3804-91fd-f5b585fb0c9e/9.webp');
        await bot.sendMessage(chatId, 'Поиск начался. В среднем процесс занимает пять и более минут. Наберись терпения и ничего не трогай!');

        for (let count = 1; count <= 10; count++){
            (function (num) {
                setTimeout(function () {
                    let url = (`https://www.avito.ru/ufa/kvartiry/prodam/${analyticsInitialData[1]}/${analyticsInitialData[0]}-${analyticsInitialData[2]}?cd=1&p=` + count);
                    analyticsSender(url, chatId);
                }, 3000 * num * (Math.floor(Math.random() * 10 + 1)))
            }(count, analyticsInitialData));
        }
    };
});

start();
