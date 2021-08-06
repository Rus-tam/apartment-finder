const cheerio = require("cheerio");

const getPrices = (res) => {
    const baseUrl = 'https://www.avito.ru';
    let prices = [];
    let urls = [];
    let titles = [];
    let indexes = [];
    let apartmentAdsUrl = [];
    let apartmentTitles = [];
    let apartmentArea = [];
    let purifiedApartmentArea = [];
    let result = 0;

    let $ = cheerio.load(res);

    //Ссылка на конкретное объявление
    $('.link-link-39EVK').each((i, elem) => {
        urls.push($(elem).attr('href'));
        titles.push($(elem).text());
    })

    //Фильтрация списка ссылок
    //Определяем индексы ненужных элементов списка ссылок
    urls.forEach((elem, index) => {
        if (elem != undefined) {
            elem.split('/').includes('ufa' && 'kvartiry') && (!elem.slice('/').includes('prodam')) ? indexes.push(index) : null;
        }
    })
    //Создаем новые списки ссылок и заголовков без косячных вариантов
    for (let i = 0; i < urls.length; i++) {
        indexes.includes(urls.indexOf(urls[i])) ? apartmentAdsUrl.push(baseUrl.concat(urls[i])) : null;
        indexes.includes(urls.indexOf(urls[i])) ? apartmentTitles.push(titles[i].split(' ')) : null;
    }

    //Находим площадь каждой квартиры из заголовка
    apartmentTitles.forEach((elem) => {
        elem.filter((element) => {
            elem.indexOf(element) === 2 ? apartmentArea.push(element) : null;
        })
    })

    //Дополнительная очистка значений площадей от  
    apartmentArea.forEach((elem) => {
        let temporaryElem = elem.split(' ');
        temporaryElem.filter((element) => {
            if (element !== 'м²,') {
                purifiedApartmentArea.push(element)
            }
        })
    })

    //Создаем очищенный от ненужных элементов списов цен на квартиры
    $('.price-text-1HrJ_').each((i, elem) => {
        let temporaryPriceList = [];
        let price = $(elem).text().replace('₽', '').split('');
        price.forEach((e) => {
            if (e != ' ' && e !== '₽') {
                temporaryPriceList.push(e);
            }
        });
        prices.push(temporaryPriceList.join(''));
    })

    const averagePrice = (purifiedApartmentArea, prices) => {
        let pricesList = [];
        let newApartmentAreaList = [];
        let newPricesList = [];
        let averagePriceByOneMeter = 0;
        let sum = 0;
        let counter = 0;
        //Превращаем строковые значения в цифровые
        purifiedApartmentArea.forEach((elem) => newApartmentAreaList.push(parseInt(elem, 10)));
        prices.forEach((elem) => newPricesList.push(parseInt(elem, 10)));
        // Проверка равенства количества элементов в двух входящих списках
        // if (purifiedApartmentArea.length !== prices.length) {
        //     throw new Error('Количество элементов в двух поступающих списках разное!!!');
        // }
        for (let i = 0; i <= newApartmentAreaList.length; i++) {
            let price = (newPricesList[i] / newApartmentAreaList[i]);
            (typeof(price) === 'number' && !isNaN(price)) ? pricesList.push(price) : null;
        }

        pricesList.forEach((elem) => {
            sum += elem;
            counter++;
        })

        averagePriceByOneMeter = sum / counter;

        return averagePriceByOneMeter;
    }

    result = averagePrice(purifiedApartmentArea, prices);

    //Сообщение о блокировке
    let blockingMessage = $('.firewall-title').text();
    if (blockingMessage === 'Доступ с Вашего IP временно ограничен') {
        result = 'We are blocked!';
    }

    return result;
}

module.exports = getPrices;