const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const WordService = require('./helpers/WordService');
const ErrorService = require('./helpers/ErrorService');

function getWord(str) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const fileName = path.join(WORDS_DIR, str + '.html');

            fs.writeFile(fileName, xhr.responseText, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
            console.log('SUCCESS: ', str + ' word saved!');
        }
    };

    xhr.onerror = function(err) {
        console.log('ERROR: ', err);
    };

    xhr.open("GET", API_URL.replace('WORD', encodeURI(str)), true);
    xhr.send();
}

app.get('/getWord/:word', (req, res) => {
    console.log(req.params);
    const reqWord = (req.params.word || '').trim();

    WordService.getWordRaw(reqWord).then(html => {
        const word = WordService.rawToWord(html);
        console.log('SUCCESS "getWord/" - ', reqWord);

        res.send(word);
    })
    .catch(err => {
        console.log('ERROR', err.message);
        res.status(err.status || 500);

        res.send({
            word: reqWord,
            error: true,
            message: err.message,
        });
    });
})

app.listen(1071, () => {
    console.log('TDK server started.');
})
