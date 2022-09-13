# Ympäristön asennus Docker Desktop for Windows
- Projektin ajo suoraan Windowsissa ilman erillistä virtuaalikonetta.
- vaihtoehtoisesti VM/Docker, ohjeet tiedostossa asennus_vm_docker.md

## Alkutoimenpiteet
- Asenna Docker Desktop for Windows
- Avaa koodieditori (esim. VSCode) tai lataa .zip-paketti GitLabista

### VSCode ajo
- Avaa ohjelma ja mene 'Source Control'-välilehteen
- Paina 'Clone Repository' ja anna repon osoite (jos käytössä Valtorin GitLab, vaatii todennäköisesti ensin 
Two-factor authentication käyttöönottoa esim. Google Authenticator)
- Avaa uusi terminaali ja aja "`docker-compose build`" projektin juuressa
- Aja "`docker-compose up`"
- Testaa toimiiko menemällä `http://localhost/`-osoitteeseen (PS. portti 80 ei saa olla esim. Apache-palvelun käytössä)

### ZIP-paketin ajo
- Pura reposta ladattu .zip-tiedosto haluamaasi paikkaan
- Avaa windowsin komentoikkuna ja siirry projektin juureen, josta löytyy mm. 'docker-compose.yml'-tiedosto
- Aja "`docker-compose build`" ja "`docker-compose up`"
- Testaa toimiiko menemällä `http://localhost/`-osoitteeseen (http oletusportti 80, kun ei erikseen määritetty)

### Yhteys tietokantaan PgAdminilla
- Mene selaimella osoitteeseen `http://localhost:8080` ja kirjaudu sisään pgadminiin (kirjautumistiedot löytyvät `docker-compose.yml`-tiedostosta)
- Luo uusi serveri (yhteys olemassaolevaan tietokantaan): Add New Server → Name: *vapaavalintainen* → Connection-tab → Host name/address: `slk-postgres-db`, Port: `5432`, Username: `postgres`, Password: `postgres` (tunnusasetusten muuttaminen "`backend/config/config.js`"-tiedostosta (NODE_ENV!=production) ja `docker-compose.yml`(NODE_ENV=production))
- Serverin tulisi olla tämän jälkeen luotu ja tarkastellessaan siitä tulisi löytyä kaksi tietokantaa valmiiksi luotuna; `postgres` (maintenance db) ja `testdb` (pää-asiallinen tietokanta)
#### Tämän jälkeen tulisi kaikkien palveluiden olla pystyssä ja menemällä osoitteeseen `http://localhost/` tulisi sisäänkirjautumisikkunan avautua.

<br/><br/>

## Muita vinkkejä
### Pikatestaus
- pgAdminissa voit ajaa 'test_data/db/testdata_*.sql'-tiedostosta löytyvän SQL-pyynnön, joka lisää jonkin verran testidataa tietokantaan. HUOM! Resetoi samalla koko tietokannan.

Testidataa (Sequelize) saa vaihtoehtoisesti tietokantaan myös terminaalikomennolla:
`docker exec backend npx sequelize-cli db:seed:all`
Testidatan poisto (tyhjentää taulut)
`docker exec backend npx sequelize-cli db:seed:undo:all`
Sequelizen testidata löytyy /backend/seeders (komennot ajavat kansion sisällä olevat tiedostot)

### Docker resetointi
- Composen kontit saa pysäytettyä terminaalissa, josta ne on käynnistetty komennolla CTRL-C
- Välillä saattaa olla tarpeellista testauksen osalta resetoida kontit ja/tai levykuvat, varsinkin, jos tietokantaan on tullut perusteellisia muutoksia
- Pysäytä & poista kontit: "`docker stop $(docker ps -aq)`" & "`docker rm $(docker ps -aq)`"
- Poista levykuvat: "`docker rmi $(docker images -aq)`"
- Hätätilanteissa: "`docker system prune -a`" ja "`docker volume rm $(docker volume ls -f dangling=true -q)`"

- Konttien pysäytys ja poisto onnistuu myös Docker for Windows kautta, konttien kohdalta löytyy painikkeina stop ja remove.
Huom: Volumet ovat erillisiä konteista, poistetaan tarvittaessa Dockerin Volumes-sivulla.

