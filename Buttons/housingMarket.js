const housingMarket = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Первичный рынок', callback_data: 'primaryMarket'}, {text: 'Вторичный рынок', callback_data: 'secondaryMarket'}]
        ]
    }))
};

module.exports = housingMarket;