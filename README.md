# Säteilylähdekirjanpito

Päivitetty 17.12.2021

Seuranta- ja lainaussovellus säteilylähteille.  
Tarkempi dokumentaatio /docs -kansiossa.
<br><br>

## Projektiin kuuluvat kontit/palvelut:

- nginxfront (frontin/Reactin hostaus, apikutsujen proxy)
- backend (Node.js/Express - apiserveri, tietokantatoimintoihin Sequelize ORM)
- pgadmin4 (graafinen hallintatyökalu tietokannalle)
- slk-postgres-db (tietokantakontti)
- apache-login (proxy frontin ja backendin välissä, autentikointi)
- Lisätietoa asennuksesta, asetuksista ja sovelluksen käytöstä /docs -kansion dokumenteista.
  <br><br>

## Dockerympäristön pystyttäminen

Ohjeet dockerkäyttöön löytyvät tiedostoista (valitse toinen tapa, Docker Desktop for Windows on helpoin):
Docker Desktop for Windows: "asennus_docker_win.md"  
Docker virtuaalikoneessa: "asennus_vm_docker.md"
<br><br>

## Pikaohje testaukseen

### Kontitetun sovelluksen ajaminen

Komennot, joilla kontit saa käyntiin:

`docker-compose build`<br>
`docker-compose up`

Pysäytys: `<CTRL-C>`

<br>

### Testidatan lisäys ja poisto konsolin kautta

Lisätietoa dokumentista testidataohje.md

`docker exec backend npx sequelize-cli db:seed:all`<br>
`docker exec backend npx sequelize-cli db:seed:undo:all`

Tai sql-tiedostosta `"test_data/db/testdata_*.sql"` Pgadminin avulla.

<br>

### Testitunnukset loginia varten

Oletuskäyttäjät määriteltynä tiedostossa "`/apache_login/.htpasswd`"

Käyttäjätunnuksia: `admin`, `test1`, `test2`, `test3`, `test4`, `test5`  
salasana kaikilla: `password`
<br><br>
## Oletustiedot Pgadminin ja tietokannan käyttöön (tarkista/muokkaa tarvittaessa docker-compose.yml)

Pgadminin tunnus- ja yhteystiedot docker-compose.yml, oletuksena:

```
localhost:8080
tunnus: pgadmin@pgadmin.com
salasana: pgadmin4
```

Kirjautumisen jälkeen Add New Server (yhteys tietokantaan).

```
General

        Name: <vapaavalintainen>
```

```
Connection

        Host name/address: slk-postgres-db
        Port: 5432 (ei muuteta)
        Username: postgres
        Password: postgres
```
