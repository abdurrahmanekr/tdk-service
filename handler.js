const WordService = require('./helpers/WordService');

module.exports.getWord = (event, context, callback) => {
    const reqWord = (event.pathParameters.word || '').trim();

    WordService.getWordRaw(reqWord).then(html => {
        const word = WordService.rawToWord(html);
        console.log('SUCCESS "getWord/" - ', reqWord);

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
};
