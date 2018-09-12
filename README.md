# TDK Service
Türk Dil Kurumu'nun resmi sitesi üzerinden belirli standartlara göre veri getirebilen bir servis.

### Açıklama 
Çevrimdışı bir Türkçe sözlük yapmak istiyordum. TDK'nın sitesinde bir REST API yapısı bulunmadığı için herşeyi kendimin yazması gerektiğini düşündüm.

**Nodejs ile** TDK'nın sitesinden verileri çekerek ona göre işlem yapan bir servis bulamadım. Ve bu konuda yardım edebilecek topluluk çok olduğu için Nodejs'i seçtim.

#### Geçici istek adresi
Geçici olmasının sebebi sistem oturana kadar kullanılabilir. Canlıya geçildiğinde bu adres kapanabilir. Bu adres **kalıcı değildir**.

```
https://nnv7qx39h3.execute-api.us-east-1.amazonaws.com/dev/getWord/?word=KELIME
```
**KELIME** yazan yere getirmek istediğiniz kelimeyi yazarak kelime detaylarını getirebilirsiniz.

#### Kurulum
Bir AWS hesabına sahip olmalısınız.
Tüm ayarları serverless.yml dosyası üzerinde mevcut. [Serverless Framework](https://serverless.com/framework/docs/) ile kurulum yapabilirsiniz. AWS'ye yayınlamak için (deploy):

```
serverless deploy -s dev
```

## Amaç
AWS lambda kullanılarak yapılmış bu servis ile TDK üzerinde bulunan tüm özellikler servis haline getirilebilir. Ve gerçekten de kullanışlı bir sözlük olur. Şayet bu konuda (API konusunda) TDK'nın sitesi oldukça geride kalmış durumda. TDK dışında API yapılanmaları da mevcut fakat asıl güvenilecek resmi kaynak TDK olduğu için TDK'nın (eski de olsa) sitesini kullanmak durumundayız.

## Yapısı
Bu servis üzerine yapılan çağrıları ilk önce DynamoDB NoSql veritabanında kontrol ederek oradaki verileri dönüyor. Eğer veritabanında veri yok ise bu durumda TDK'nın sitesine istek atarak oradan getirdiği veriler ile yeni bir kayıt işlemi yapıyor.

## AWS Lambda
Bilindiği üzere aws lambda ile 5 dakikayı geçmeyecek şekilde fonksiyonlar çalıştırabiliyoruz. Bu proje tam da lambda'ya göre.

### getWord methodu
handler.js üzerinde lambda'nın tetikleneceği methodlar vardır.
Bunlardan biri de **getWord**. Bu method ile TDK üzerinde bulunan tüm kelimeler detaylı bir şekilde getirilebilir.

Örnek istek:

```
https://.../getWord?word=kardeş
```

Cevap:

```json
[{
    "pronunciation": "kardeş",
    "slang": false,
    "old": false,
    "etymon": null,
    "name": "kardeş",
    "casual_speech": false,
    "type": "isim",
    "descriptions": [{
        "types": ["isim"],
        "say": "Öz kardeş. Üvey kardeş. Kız kardeş. Erkek kardeş.",
        "title": "Aynı anne babadan doğmuş veya anne babalarından biri aynı olan çocukların birbirine göre adı",
        "author": null
    }, {
        "types": null,
        "say": null,
        "title": "Yaşça küçük olan çocuk",
        "author": null
    }, {
        "types": ["ünlem"],
        "say": null,
        "title": "Adı bilinmeyen kimselere söylenen bir seslenme sözü",
        "author": null
    }, {
        "types": null,
        "say": "Din kardeşi. Yol kardeşi.",
        "title": "Aralarında değer verilen ortak bir bağ bulunanlardan her biri",
        "author": null
    }],
    "colloquialism": false,
    "tags": []
}]

```
### Ana Değerler

| Anahtar | Anlamı |
| --- | --- |
| pronunciation | okunuş |
| slang | argo ise `true` değilse `false` |
| old | eskimiş |
| etymon | kelimenin kökeni ör: `{name: "İngilizce",description: "test"}` kelime kökeni yoksa **Türkçe**'dir |
| name | kelimenin kendisi |
| casual_speech | gündelik konuşma, teklifsiz konuşmada |
| type | kelime türü (isim, sıfat vb.) |
| descriptions | kelimeyle ilgili anlamlar  |

### Açıklama (descriptions)
| Anahtar | Anlamı |
| --- | --- |
| types | açıklamanın tüm türleri |
| say | açıklamanın hakkında söylem |
| title | açıklamanın kendisi |
| author | **say** değerinde yazan betiği söyleyen kişi  |

## Katkı
API tarafında yeterli olmadığını düşündüğüm yerler var mesela veriler güncellenmiyor ve güncellenme tarihleri kaydedilmiyor. TDK kelime sayfasından getirilen kelime tam anlamıyla modellenmedi. Örneğin o kelime ile ilgili deyimler kaydedilmiyor.

#### Eklenebilecek diğer özellikler

- Atasözleri ve Deyimler Sözlüğü
- Bilim ve Sanat Terimleri 
- Kişi Adları Sözlüğü
- Yazım Kuralları

