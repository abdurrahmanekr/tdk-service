const path = require('path');
const fs = require('fs');
const {
    API_URL,
    WORDS_DIR,
} = require('./constants');

const cheerio = require('cheerio');

function parseSubstantive($) {
    var table = $('table#hor-minimalist-a');

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

    etymon = title.children('i').text().trim().split(' ');

    return {
        name: name,
        type: type,
        tags: tags,
        etymon: etymon.length > 0 ? ({
            name: etymon[0],
            description: etymon[1],
        }) : null,
    }
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

            console.log(parseSubstantive($));
        }
    })
}

wordMaker('peşkeş');