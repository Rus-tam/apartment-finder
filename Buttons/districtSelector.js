const districtSelector = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Демский', callback_data: '70'}, {text: 'Калининский', callback_data: '71'}, {text: 'Кировский', callback_data: '72'}],
            [{text: 'Ленинский', callback_data: '73'}, {text: 'Октябрьский', callback_data: '74'}, {text: 'Орджоникидзевский', callback_data: '75'}],
            [{text: 'Советсткий', callback_data: '76'}]
        ]
    })
};

module.exports = districtSelector;