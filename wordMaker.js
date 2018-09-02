const path = require('path');
const fs = require('fs');
const {
    API_URL,
    WORDS_DIR,
} = require('./constants');

const cheerio = require('cheerio');

function parseSubstantive($) {
    var result = [];

    $('table#hor-minimalist-a').map((i, elem) => {
        var table = $(elem);
        /*
            test: " <b>test  </b> <br><i><b>isim  </b> İngilizce test</i>"
            dişi: " <b>dişi  </b> <br><i><b>sıfat, anatomi  </b> </i>"
            penisilin: " <b>penisilin  </b> <br><i><b>isim, tıp (***)  </b> Fransızca pénicilline</i>"
        */

        var title = table.children('thead').children('tr').children('th');
        var name = title.children('b').html().trim();
        var type = title.children('i').children('b').html().split(',')[0].trim();
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

            var type = description.children('i').eq(0).text();
            description.children('i').eq(0).remove();


            var author = description.children('b').text();
            var say = description.children('i').text();
            description.children('i').remove();

            var title = description.html().split('<br>')[0].trim();
            title = title.substring(title.indexOf('.') + 1, title.length).trim();

            descriptions.push({
                type: type || null,
                title: title,
                say: say || null,
                author: author || null,
            })
        });

        result.push({
            name: name,
            type: type,
            tags: tags,
            descriptions: descriptions,
            etymon: etymon.length > 0 ? ({
                name: etymon[0],
                description: etymon[1],
            }) : null,
        });
    });

    return result;
}

function parseSaying(dom) {
    // body...
}

function wordMaker(word) {
    const filePath = path.join(WORDS_DIR, word + '.html');

    fs.readFile(filePath, 'utf8', function(err, html){
        if (!err){
            var $ = cheerio.load(html, {
                decodeEntities: false
            });

            console.log(JSON.stringify(parseSubstantive($), null, "    "));
        }
    })
}

wordMaker('bek');
