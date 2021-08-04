const cheerio = require("cheerio");

const getPrices = (res) => {
    const baseUrl = 'https://www.avito.ru';
    let prices = [];
    let urls = [];
    let titles = [];
    let indexes = [];
    let apartmentAdsUrl = [];
    let apartmentTitles = [];

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
        indexes.includes(urls.indexOf(urls[i])) ? apartmentTitles.push(titles[i]) : null;
    }

    $('.price-text-1HrJ_').each((i, elem) => {
        //prices.push($(elem).text());
        let price = $(elem).text().replace('₽', '');

        let decomposedPriceList = [];
        let decomposedPrice = price.split('');
        decomposedPrice.forEach((e) => {
            if (e != ' ' && e !== '₽') {
                decomposedPriceList.push(e);
            }
        })

        prices.push(decomposedPriceList.join(''));

    })

    // let k = prices.forEach((e) => {
    //     for (let elem of e) {
    //         if (elem != '₽') {
    //             try {
    //                 Number(elem);
    //             } catch(error) {
    //                 throw error;
    //             }
    //         }
    //     }
    // });

    return prices;
}

module.exports = getPrices;