const nextPage = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Страница 2', callback_data: '2'}, {text: 'Страница 3', callback_data: '3'}, {text: 'Страница 4', callback_data: '4'}],
            [{text: 'Страница 5', callback_data: '5'}, {text: 'Страница 6', callback_data: '6'}, {text: 'Страница 7', callback_data: '7'}],
            [{text: 'Страница 8', callback_data: '8'}, {text: 'Страница 9', callback_data: '9'}, {text: 'Страница 10', callback_data: '10'}]
        ]
    }))
};

module.exports = nextPage;