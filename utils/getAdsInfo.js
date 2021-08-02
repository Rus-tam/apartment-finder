const cheerio = require('cheerio');


const getAdsInfo = (res) => {
    const baseUrl = 'https://www.avito.ru';
    let urls = [];
    let apartmentAdsUrl = [];
    let apartmentTitles = [];
    let prices = [];
    let titles = [];
    let indexes = [];
    let streatName = [];
    let districtName = [];
    let dates = [];
    let adInfo = [];
    let apartmentInfo = [];

    let $ = cheerio.load(res.body);

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
        indexes.includes(urls.indexOf(urls[i])) ? apartmentTitles.push(titles[i]) : null;
    }

    //Цены квартир
    $('.price-text-1HrJ_').each((i, elem) => {
        prices.push($(elem).text());
    })

    //Адреса квартир
    $('.geo-address-9QndR').each((i, elem) => {
        streatName.push($(elem).text());
    })
    $('.geo-georeferences-3or5Q').each((i, elem) => {
        districtName.push($(elem).text());
    })

    //Время прошедшее с выставления объявления
    $('.date-text-2jSvU').each((i, elem) => {
        dates.push($(elem).text());
    })

    //Частное объявление или агенство
    $('.iva-item-text-2xkfp').each((i, elem) => {
        apartmentInfo.push($(elem).text());
    })

    for (let i = 0; i < apartmentAdsUrl.length; i++) {
        adInfo.push({
            apartmentTitles: apartmentTitles[i],
            apartmentAdsUrl: apartmentAdsUrl[i],
            prices: prices[i],
            streatName: streatName[i],
            districtName: districtName[i],
            apartmentInfo: apartmentInfo[i],
            dates: dates[i]
        });
    };

    return adInfo;
}



module.exports = getAdsInfo;

