const path = require('path');

module.exports = {
    API_URL: "http://www.tdk.org.tr/index.php?option=com_gts&arama=gts&kelime=WORD",
    TDK_WORD_LIST_URL: "http://tdk.gov.tr/index.php?option=com_yazimkilavuzu&view=yazimkilavuzu&kategori1=yazim_listeli&ayn1=bas&kelime1=WORD&sayfa1=PAGE",
    AWS_API_URL: "https://nnv7qx39h3.execute-api.us-east-1.amazonaws.com/dev/getWord/?word=WORD",
    WORDS_DIR: path.join(__dirname, 'words'),
    WORDS_JSON_DIR: path.join(__dirname, 'words_json'),
};
