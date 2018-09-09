var async = require('async');
var fs = require('fs');
var path = require('path');
var filenamify = require('filenamify');
var express = require('express');

const { BOT_URL, WORDS_DIR, WORDS_JSON_DIR } = require('./constants');
const WordService = require('./helpers/WordService');

const app = express();

app.get('/', (req, res) => {

});

var words = process.argv.find(x => x.indexOf('--words=') !== -1);

app.listen(1071, () => {
    console.log('1071', 'dinleniyor');

    if (words !== undefined) {
        words = words.split('=')[1].split(',');

        var res = [];

        words.map(x => {
            var fileName = path.join(WORDS_DIR, x + '.json');
            var original_words = fs.readFileSync(fileName).toString();
            original_words = JSON.parse(original_words);

            res = res.concat(original_words);
        });

        words = res;
    }

    var run = (index = 0) => {
        var word = words[index];

        var cb = (data) => {
            console.log('İstek bitti', data);
            run(index + 1);
        };

        const fileName = path.join(WORDS_JSON_DIR, filenamify(word) + '.json');

        if (fs.existsSync(fileName)) {
            cb(fs.readFileSync(fileName).toString(), index);
            return;
        }

        WordService.saveWord(word).then(res => {

            fs.writeFile(fileName, res, function(err) {
                if(err) {
                    console.log(err);
                }
            });

            cb(JSON.stringify(res), index);
        })
        .catch(err => cb(err, index));
    };

    run();
})
