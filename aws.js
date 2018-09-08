var async = require('async');
var fs = require('fs');
var path = require('path');

const { BOT_URL, WORDS_DIR, WORDS_JSON_DIR } = require('./constants');
const WordService = require('./helpers/WordService');

var words = process.argv.find(x => x.indexOf('--words=') !== -1);


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

var calls = [];

words.map(word => {
    calls.push((cb) => {
        const fileName = path.join(WORDS_JSON_DIR, word + '.json');

        if (fs.existsSync(fileName)) {
            cb(fs.readFileSync(fileName).toString());
            return;
        }

        WordService.saveWord(word).then(res => {

            fs.writeFile(fileName, res, function(err) {
                if(err) {
                    console.log(err);
                }
            });

            cb(JSON.stringify(res));
        })
        .catch(cb);
    });
})

async.parallel(calls, function(err, result) {
    /* this code will run after all calls finished the job or
       when any of the calls passes an error */
    if (err)
        return console.log(err);
    console.log(result);
});

