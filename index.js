const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fs = require('fs');
const path = require('path');

const {
    API_URL,
    WORDS_DIR,
} = require('./constants');

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

getWord('bek');
