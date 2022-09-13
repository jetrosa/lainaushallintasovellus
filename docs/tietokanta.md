Päivitetty 16.12.2021
# Tietokanta

Dokumentissa keskeisimmät tiedot projektissa käytetystä tietokantaratkaisusta konttimuodossa (`docker-compose`). 

Tietokantasovellus on docker-imagesta `postgres` muodostetussa kontissa. Tietokannan data tallentuu Dockerin volumeen pg-data.

Tietokantan graafista hallintaa varten käytössä on myös `pgadmin` (image: dpage/pgadmin4)

Tietokantaan on pääsy vain docker-composen muista palveluista (ei julkaistua porttia). Lisärajauksena Dockerin sisäinen verkko skpbacknet, samassa verkossa tietokannan kanssa vain apiserveri ja pgadmin.

## Alkudata
Postgres sisältää erityiskansion `'docker-entrypoint-initdb.d'`.
Kontin käynnistyksen yhteydessä ajetaan kansiossa olevat scriptit, jos datahakemisto (Docker-volumessa pg-data) on tyhjä (ensimmäinen käynnistyskerta).

Projektin `'./db_init'` -kansion sisältö kopioidaan postgres-hakemistoon docker-entrypoint-initdb.d, jolla on erityismerkitys:
- muodostetaan käynnistyksen yhteydessä tietokanta ja suoritetaan kansion sisällä olevat scriptit (*.sql, *.sql.gz, tai *.sh) 
- scriptit suoritetaan, jos datahakemisto on tyhjä (kontin ensimmäinen käynnistyskerta)
- Scriptit ajetaan nimijärjestyksessä (kannattaa numeroida scriptit)
- Lisätietoa postgres-image asetuksista ym. https://hub.docker.com/_/postgres

Projektissa on kolme scriptiä (/db_init), joista muodostetaan tietokannan alkutilanne:
- `'1-schema.sql'` - tietokannan taulukkorakenne
- `'2-required_data.sql'` - sovelluksen vaatima pakollinen pohjadata, eli käyttöoikeustasot ja yksiköt (yksiköitä voi muokata/lisätä, mutta ensimmäisellä (VALO) on erityismerkitys, se laajentaa käyttäjän oikeustason ja yksikön koko osaston laajuiseksi)
- `'3-nuclides.sql'` - nuklidilistaus (nimet ja puoliintumisajat)

## Datan lisäys ja muokkaus
Ensisijaisesti tietokantatietoa käsitellään apin kautta, ja apia käytetään frontendin käyttöliittymän kautta. Apireitteihin pääsee myös frontin kautta `<frontin osoite>/api/<backend api route> (proxy)`

Hallinta onnistuu myös:
- `pgadminin` avulla. Pgadminissa voidaan tietokantaan kohdistaa sql-script tai muokata tietokannan tietoja graafisesti
- `docker exec` -komennolla voi ottaa yhteyden tietokantakonttiin

## Asetukset ja testidata
Keskeiset käyttöasetukset voidaan asettaa ympäristömuuttujina docker-composessa. 
- Asetuksista lisää `'asetukset*.md'` -dokumentissa.
- Testidatavaihtoehtoja käsittelee `'testidataohje.md'`

## Varmuuskopiointi
Varmuuskopio voidaan ottaa pgAdminin avulla manuaalisesti. Ohessa scriptit, joita voi hyödyntää kopion ajastuksessa -  ottavat loogisen kopion Dockerissa olevasta tietokannasta (jos kokeilet Windowsin puolella, tiedoston aikaformaatti ei sellaisenaan toimi, ota pois tai muokkaa).  

Varmuuskopiot erikseen yleistiedoista ja tietokantasisällöstä. Esimerkkiscripteissä keskeiset muuttujat saadaan ympäristömuuttujista.

### Vain tietokanta 
(postgres sisäänrakennettu pakkaustoiminto "-Fc -Z 9"):   
`docker exec -t slk-postgres-db bash -c 'PGPASSWORD=$POSTGRES_PASSWORD pg_dump -Fc -Z 9 -U $POSTGRES_USER $POSTGRES_DB' > dump_$(date +"%Y-%m-%d_%H_%M_%S")`

### Yleistiedot - tietokantakäyttäjät, roolit ym.
pakkaamaton:  
`docker exec -t slk-postgres-db bash -c 'PGPASSWORD=$POSTGRES_PASSWORD pg_dumpall -g -U $POSTGRES_USER' > ./globals_$(date +"%Y-%m-%d_%H_%M_%S").sql`

Palautukseen ei ole esimerkkiä/valmista toteutusta. Palautus onnistuu pgAdminin avulla tai `pg_restore` -toiminnolla.

## Backend/API - Sequelize

Tietokantaa käsitellään ensisijaisesti olioina (Sequelize ORM). Sequelize.sync luo tietokantataulut malleista, jos sen nimistä taulua ei tietokannassa vielä ole. Mahdollista on myös korvata olemassaoleva tietokantamalli sequelizen mallilla (`sync({ force: true })`, ei tuotantokäyttöön). Sequelizen malleista generoituvat sql-queryt, jotka voidaan myös kopioida talteen ja käyttää tietokannan luomiseen.

- `'/backend/models'` - tietokantatauluja kuvaavat oliot, malleja voitaisiin käyttää myös tietokannan luomiseen
- `'/backend/seeders'` - tietokannan alkudata (voisi olla tietokantakontin aloituskansion sijaan täällä, seederit nyt testidatakäytössä)
- `'models/init-models'` - riippuvuusmääritykset
esim:
  - `kayttajat.belongsTo(oikeustasot, {  foreignKey: "oikeustaso"});`  
mahdollistaa kutsun kayttaja.getOikeustasot()
  - `oikeustasot.hasMany(kayttajat, {  foreignKey: "oikeustaso"});`    
  mahdollistaa kutsun oikeustaso.getKayttajat()  

Näistä muodostuu tietokantataululle myös foreign key, jos sequelizea käytetään tietokannan luomiseen. 


    