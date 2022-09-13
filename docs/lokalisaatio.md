# Lokalisaatio-ohje

Lokalisaatio hoidetaan käyttämällä 'i18next'-pakettia ja muutamalla lisäosalla; 'i18next-browser-languagedetector' ja 'i18next-http-backend'. "Kielidetektorin" tarkoitus on tallentaa sillä hetkellä valittu kieli selaimen johonkin osaan (keksi, localstorage ja/tai sessionstorage). On myös vastuussa sen hakemisesta, vaikka sen pystyy myös tarvittaessa itse hakemaan melko vaivattomasti. "Kielibäckärin" tarkoitus ladata kielitiedostot ainoastaan, kun käyttäjä yhden niistä tarvitsee. Näiden, ja itse pääpalikan conffaus onnistuu 'i18n.js'-tiedostosta, mm. kielitiedostojen hakupolku ja debugin enablointi/disablointi (toistaiseksi vielä enabloitu).

## Stringien muokkaus
Lokalisaatiotiedostot löytyvät projektista 'client/public/locales'-kansion alta. Ovat jaettuina kielikohtaisiin kansioihin. Kansioista löytyvät 'translation.js' nimiset tiedostot, jotka sisältävät 'avain-arvo' -pareja. 

Tavallisten stringien muokkaus tuskin aiheuttaa mitään ongelmia, mutta parametrilliset saattavat niitä aiheuttaa. Parhaiten ne varmaan ymmärtää muutamalla esimerkillä:

### Avaimen arvo:
`Reference date: {{date, date(day: numeric; month: numeric; year: numeric; hour: numeric; minute: numeric)}}`

### Koodissa: 
`t("one-sample-popup_reference-date", { date: new Date(props.sample.referenssi_pvm), })`
***
### Avaimen arvo: 
`Best before: {{date, date(day: numeric; month: numeric; year: numeric)}}`

### Koodissa: 
`t("one-sample-popup_best-before-date", { date: new Date(props.sample.parasta_ennen_pvm), })`
***
### Avaimen arvo: 
`Returned by {{firstName}} {{lastName}} on {{date, date(day: numeric; month: numeric; year: numeric)}}`

### Koodissa:
`t('long-key1', {firstName: loan.palauttaja.etunimi, lastName: loan.palauttaja.sukunimi}, {date: loan.palautus_pvm})`
***
Huomioitavaa:
- Jotta päivämäärät saadaan oikeaan muotoon tarvitaan myös oikean muotoinen vastine koodista. Tiedostosta 'i18n-format.js' löytyy, kuinka itse formatointi tapahtuu. Päivämäärät myös formatoidaan sen hetkisen lokaalin mukaan. Ks. Intl dokumentointi. 
- Useat, ilman callbackiä toimivat, muuttujat tulee antaa kääntäjälle samassa objektissa, tai muutoin käännös saattaa "myöhästyä" renderistä, jolloin käännöksen tilalla on ainoastaan tyhjää.
- Avaimet on koitettu nimietä periaatteella: "komponentin-nimi_komponentin-osa".
