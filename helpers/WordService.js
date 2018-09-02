const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const {
    API_URL,
    WORDS_DIR,
} = require('../constants');

const cheerio = require('cheerio');
const NE = require('node-exceptions')

const WordService = {
    /*
     * Tdk'nın sitesinden istenilen kelimenin sayfasını raw olarak getirir
     * @param {string} word - getirilecek gelime
    */
    getWordRaw: (word) => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status === 200) {
                        resolve(xhr.responseText);
                    }
                    else {
                        reject(new NE.HttpException('TDK request error.', 500));
                    }
                }
            };

            xhr.onerror = function(err) {
                reject(err);
            };

            xhr.open("GET", API_URL.replace('WORD', encodeURI(word)), true);
            xhr.send();
        });
    },

    /*
     * Tdk'nın sitesinden getirilen raw html değerinin içinden kelimeye ait tüm özellikleri getirir
     * @param {string} raw - tdk kelime sayfasından gelen raw html değer
    */
    rawToWord: (raw) => {
        var $ = cheerio.load(raw, {
            decodeEntities: false
        });

        var result = [];

        $('table#hor-minimalist-a').map((i, elem) => {
            var table = $(elem);

            var title = table.children('thead').children('tr').children('th');
            var name = title.children('b').html().trim();
            var type = title.children('i').children('b').html().split(',')[0].trim();

            var colloquialism = false;

            if (type.indexOf('halk ağzında') !== -1) {
                type = type.replace('halk ağzında', '').trim();
                colloquialism = true;
            }

            var slang = false;

            if (type.indexOf('kaba konuşmada') !== -1) {
                type = type.replace('kaba konuşmada', '').trim();
                slang = true;
            }

            var pronunciation = name;

            if (type.match(/\(.*\)/g) !== null) {
                pronunciation = type.match(/\(.*\)/g)[0].replace(/[\(\)]/g, '');
                type = type.replace(/\(.*\)/g, '').trim();
            }

            var tags = title.children('i').children('b').html().split(',');
            tags.splice(0, 1);
            tags = tags.map(function (x) {
                return x.trim();
            });

            var etymon = title.children('i').children('b').remove();

            etymon = title.children('i').text().trim().split(' ').filter(x => x !== "");

            var descriptions = [];

            table.children('tbody').children('tr').map((i, elem) => {
                var description = $(elem).children('td');

                var types = description.children('i').eq(0).text();
                description.children('i').eq(0).remove();


                var author = description.children('b').text();
                var say = description.children('i').text();
                description.children('i').remove();

                var title = description.html().split('<br>')[0].trim();
                title = title.substring(title.indexOf('.') + 1, title.length).trim();

                descriptions.push({
                    types: (types && types.split(',')) || null,
                    title: title,
                    say: say || null,
                    author: author || null,
                })
            });

            result.push({
                name: name,
                type: type,
                colloquialism: colloquialism,
                pronunciation: pronunciation,
                slang: slang,
                tags: tags,
                descriptions: descriptions,
                etymon: etymon.length > 0 ? ({
                    name: etymon[0],
                    description: etymon[1],
                }) : null,
            });
        });

        if (result.length > 0)
            return result;

        throw new NE.HttpException('Word not found', 404);
    },
};

module.exports = WordService;
