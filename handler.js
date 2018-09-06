const WordService = require('./helpers/WordService');
const DBService = require('./helpers/DBService');


module.exports.getWord = (event, context, callback) => {
    const reqWord = (event.pathParameters.word || '').trim();

    DBService.get(reqWord, (err, data) => {
        if (!err && data && data.Item) {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(data.Item.data),
            });
        }
        else {
            WordService.getWordRaw(reqWord).then(html => {
                const word = WordService.rawToWord(html);
                console.log('SUCCESS "getWord/" - ', reqWord);

                DBService.set(reqWord, word);

                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(word),
                });
            })
            .catch(err => {
                console.log('ERROR', err.message);

                callback(null, {
                    statusCode: err.status || 500,
                    body: err.message,
                });
            });
        }
    });
};
