const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const {
    API_URL,
    TDK_WORD_LIST_URL,
    WORDS_DIR,
} = require('../constants');

const cheerio = require('cheerio');
const NE = require('node-exceptions')

const WordService = {
    /*
     * Tdk'nın sitesinden istenilen kelimenin sayfasını veya arama listesini raw olarak getirir
     * @param {string} word - getirilecek gelime
     * @param {string} type - bu kelime ile başlayan gelimelerin listesini getirmeyi sağlar
     * @param {string} page - sayfa
    */
    getWordRaw: (word, type = 'word', page = '') => {
        return new Promise((resolve, reject) => {
            var errorCount = 0;

            var sendError = () => {
                reject(new NE.HttpException('TDK request error.', 500));
            };

            var sendRequest = () => {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        if (this.status === 200) {
                            resolve(xhr.responseText);
                        }
                    }
                };

                var open = () => {
                    switch (type) {
                        case 'word':
                            xhr.open("GET", API_URL.replace('WORD', encodeURI(word)), true);
                            break;
                        case 'word_list':
                            xhr.open("GET", TDK_WORD_LIST_URL.replace('WORD', encodeURI(word)).replace('PAGE', page), true);
                            break;
                    }
                };

                xhr.onerror = function(err) {
                    console.log('TDK request error, Trying again.');
                    if (errorCount++ < 10) {
                        setTimeout(() => {
                            sendRequest();
                        }, 5500);
                    }
                    else {
                        sendError();
                    }
                };
                open();

                xhr.send();
            };

            sendRequest();

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

            var casual_speech = false;

            if (type.indexOf('teklifsiz konuşmada') !== -1) {
                type = type.replace('teklifsiz konuşmada', '').trim();
                casual_speech = true;
            }

            var slang = false;

            if (type.indexOf('kaba konuşmada') !== -1) {
                type = type.replace('kaba konuşmada', '').trim();
                slang = true;
            }

            if (type.indexOf('argo') !== -1) {
                type = type.replace('argo', '').trim();
                slang = true;
            }

            var old = false;

            if (type.indexOf('eskimiş') !== -1) {
                type = type.replace('eskimiş', '').trim();
                old = true;
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
                old: old,
                casual_speech: casual_speech,
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

    /*
     * Tdk'nın sitesinden bu kelime ile başlayan kelimelerin hepsini listesini
     * @param {string} word - aranacak kelime
     * @param {string} page - aranacak kelimenin hangi sayfada olduğu
    */
    getFirstWord: (word, page) => {
        return new Promise((resolve, reject) => {
            WordService.getWordRaw(word, 'word_list', page).then(raw => {
                var list = WordService.rawToWordList(raw);
                var result = list.data;

                console.log(list.page, list.max, list.final, list.nextPage);

                // bitmemişse
                if (!list.final) {
                    WordService.getFirstWord(word, list.nextPage).then(res => {
                        resolve(result.concat(res));
                    })
                }
                else {
                    resolve(result);
                }
            })
            .catch(err => {
                console.log('parçalarken sorun', err);
            });
        })
    },

    /*
     * Tdk'nın sitesinden getirilen raw listesinin içindeki gelimeleri parçalar
     * @param {string} raw - tdk kelime sayfasından gelen raw html değer
    */
    rawToWordList: (raw) => {
        var $ = cheerio.load(raw, {
            decodeEntities: false
        });

        var konts = $('select[name=konts]');
        page = konts.children('option[selected]').text().trim();

        var nextPage = konts.children('option').eq(parseInt(page) === 1 ? 2 : parseInt(page) + 1);

        nextPage = nextPage ? nextPage.attr('value') : null;

        var max = konts.children('option').last().text().trim();

        var result = [];

        $('p.thomicb').map((i, elem) => {
            var p = $(elem);

            var word = p.children('a').eq(1).text();

            word = word.split(',')[0].split('(')[0].trim();

            result.push(word);
        });

        if (result.length > 0)
            return {
                page: parseInt(page),
                nextPage: parseInt(nextPage),
                max: parseInt(max),
                final: page === max,
                data: result,
            };

        throw new NE.HttpException('Word list not found', 404);
    },
};

module.exports = WordService;
