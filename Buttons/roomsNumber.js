const roomsNumber = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: '1 комната', callback_data: 'oneRoom'}, {text: '2 комнаты', callback_data: 'twoRooms'}, {text: '3 комнаты', callback_data: 'threeRooms'}],
            [{text: '4 комнаты', callback_data: 'fourRooms'}, {text: 'студия', callback_data: 'studii'}]
        ]
    }))
}

module.exports = roomsNumber;