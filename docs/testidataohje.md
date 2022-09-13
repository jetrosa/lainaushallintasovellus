Päivitetty 13.12.2021
# Testidataohje

## Sequelize-cli

Testidataa on mahdollista siirtää tietokantaan sequelize-cli kautta (testidatamääritykset `"/backend/seeders"`)

Testidata seedereistä dockerkontin tietokantaan ja sieltä pois:
```
docker exec backend npx sequelize-cli db:seed:all
docker exec backend npx sequelize-cli db:seed:undo:all
```
***
## Scriptillä terminaalista

Dockerkäytössä voidaan terminaalista (projektikansion juuressa) lisätä tietokantaan tiedostosta `insertTestUser.sql` käyttäjätunnus seuraavalla 
komennolla (voidaan muokata tarpeen mukaan tai korvata komennon sql)  
-i <tietokantakontti dockerissa> -U <POSTGRES_USER><POSTGRES_DB>

`cat ./insertTestUser.sql | docker exec -i slk-postgres-db /bin/bash -c "export PGPASSWORD=postgres && psql -U postgres testdb`
***
## SQL PgAdminin kautta

Vaihtoehtoisesti testidataa saa käyttöön myös sql-tiedostolla `"test_data/db/testdata_202110.sql"`,
sql voidaan ajaa pgadminin kautta. Pgadminin määritykset docker-compose.yml,
kirjoitushetkellä: 
```
pgadmin url: http://localhost:8080, 
tunnus pgadmin@pgadmin.com, 
salasana: pgadmin4

tietokantaserverin osoite: slk-postgres-db, 
portti: 5432, 
tietokannan käyttäjä: postgres, 
salasana: postgres
```