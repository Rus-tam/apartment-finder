const cheerio = require("cheerio");

const getPrices = (res) => {
    let prices = [];

    let $ = cheerio.load(res);
    $('.price-text-1HrJ_').each((i, elem) => {
        prices.push($(elem).text());
    })

    return prices;
}

module.exports = getPrices;