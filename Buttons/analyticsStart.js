const analyticsStart = {
    reply_markup: JSON.stringify(({
        inline_keyboard: [
            [{text: 'Поехали!', callback_data: 'analyticsRun'}]
        ]
    }))
};

module.exports = analyticsStart;