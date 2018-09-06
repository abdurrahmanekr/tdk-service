const AWS = require('aws-sdk');
const CNF = require('../config');

AWS.config.update({
    region: CNF.region,
});

const DBService = {
    /*
     * DynamoDB bağlantısı için gerekli olan bağlantı
    */
    docClient: new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10'
    }),

    /*
     * Dynamodb üzerinde kelime varsa getirir
     * @param {string} word - kelimenin kendisi
     * @param {function} callback - sonucu döndürür
    */
    get: (word, callback = () => void(0)) => {
        var params = {
            TableName: CNF.tableName,
            Key: {
                word: word,
            },
        };

        DBService.docClient.get(params, function(err, data) {
            if (err) {
                console.log("ERROR: " + word + " kelimesi getirilemedi", err);
                callback(err, data);
            }
            else {
                console.log("SUCCESS: Kelime getirildi", data && data.Item);
                callback(null, data);
            }
        });
    },

    /*
     * Dynamodb üzerinde kelime varsa değiştirir
     * @param {string} word - kelimenin kendisi
     * @param {object} data - kelimenin verisi
     * @param {function} callback - sonucu döndürür
    */
    set: (word, data, callback = () => void(0)) => {
        var params = {
            TableName: CNF.tableName,
            Item: {
                id: String(+new Date()),
                word: String(word),
                data: data,
            },
        };

        DBService.get(word, (err, data) => {
            if (err !== null)
                return callback(err, data);

            if (data && data.Item) {
                var updateParams = {
                    TableName: 'EPISODES_TABLE',
                    Key: {
                        'word': String(word),
                    },
                    UpdateExpression: 'set data = :d',
                    ExpressionAttributeValues: {
                        ':d': params.Item.data,
                    },
                };

                DBService.docClient.update(updateParams, function(err, data) {
                    if (err) {
                        console.log("ERROR: " + word + " kelimesi güncellenemedi", err);
                        callback(err, data);
                    }
                    else {
                        console.log("SUCCESS: " + word + " kelimesi güncellendi", data);
                        callback(null, data)
                    }
                });
            }
            else {
                DBService.docClient.put(params, (err, data) => {
                    if (err) {
                        console.log("ERROR: Veritabanına eklenemedi", err);
                        callback(err, data);
                    }
                    else {
                        callback(null, data);
                        console.log("SUCCESS: Ekleme başarılı", data);
                    }
                });
            }
        })
    },
};

module.exports = DBService;
