Päivitetty 13.12.2021

# Projektiin kuuluvat kontit/palvelut

- `nginxfront` (frontin/Reactin hostaus, apikutsujen proxy)
- `backend` (node/node express - apiserveri)
- `pgadmin4` (graafinen hallintatyökalu tietokannalle)
- `slk-postgres-db` (tietokantakontti)
- `apache-login` (proxy frontin ja backendin välissä, - autentikointi)
<br><br>
# Asetukset

Ympäristömuuttujia voidaan asettaa usealla eri tavalla. Tässä prioriteettijärjestys:

https://docs.docker.com/compose/environment-variables/
When you set the same environment variable in multiple files, here’s the priority used by Compose to choose which value to use:

1.    Compose file
2.    Shell environment variables
3.    Environment file
4.    Dockerfile
5.    Variable is not defined
<br><br>
# Portit:

Palvelun porttien julkaisu hostille docker composessa: <br> `ports: <HOST_PORT>:<DOCKER_PORT>`  
`EXPOSE` -komennolla saa portin dockerin sisäiseen käyttöön myös composen ulkopuolelle (Dockerfile tai docker-compose)

- nginxfront: `80` (julkinen) - `"client/ngingx/nginx.conf"`
- backend:    `3002` (Docker composen sisäinen portti) - backend env `PORT`
- pgadmin4:   `8080` (julkinen) - docker-compose.yml - pgadmin env `PGADMIN_LISTEN_PORT`
- slk-postgres-db: `5432` (Docker composen sisäinen portti) - imagen default
- apache-login: `81` (Docker composen sisäinen portti) - `"apache_login/httpd.conf"` `LISTEN <PORT>` ja `"apache_login/vhost.conf"` `VirtualHost *:<PORT>`
<br><br>
# Tunnukset (docker-compose.yml):

## Salaustunnus sessiota varten (cookie) 

```
  backend
    environment:
      SESSION_SECRET: secret
``` 

## Tietokantatunnukset (määritetään samat tiedot tietokannalle ja backendin yhteyttä varten):
```
  database
    environment:
      PGHOST: slk-postgres-db
      POSTGRES_DB: testdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres   
```
vaihda samalla samaksi myös composen database-healthcheckin tunnus  
(`'-U <POSTGRES_USER>'`):
```
        test: ["CMD-SHELL", "pg_isready -U postgres"]
```
```
backend
  environment:
    DB_HOST: slk-postgres-db
    DB_DATABASE: testdb
    DB_USERNAME: postgres
    DB_PASSWORD: postgres
```

## pgadmin4
    pgadmin4
      environment: 
        PGADMIN_DEFAULT_PASSWORD: pgadmin4
        PGADMIN_DEFAULT_EMAIL: pgadmin@pgadmin.com

## Apache-login/proxy
Testikäyttäjät & Salasana basic auth tiedostossa apache_login/.htpasswd

    Käyttäjätunnuksia: admin, test1, test2, test3, test4, test5
    salasana kaikilla: password

Tiedostoa voi muokata, mutta tuotantovaiheessa kun basic auth on korvattu, tiedosto on tarpeeton ja
voidaan dockerfilestä poistaa <br>
`COPY .htpasswd /etc/apache2/.htpasswd`
<br><br>
# Käyttäjätunnus/oikeustiedot tietokannassa:

Käyttäjä luodaan tietokantaan automaattisesti onnistuneen kirjautumisen (apache) jälkeen.

Uusi käyttäjä saa kuitenkin vain vierasoikeudet, eli ei vielä pääse käyttämään sovellusta (reactissa pending-sivu).

Käyttäjän oikeustason ja osaston määrittelee admin sovelluksen adminpaneelin kautta. Ensimmäinen adminkorotus
voidaan tehdä pgadminin avulla (selaimessa `<HOST_URL:PGADMIN_LISTEN_PORT>` default `localhost:8080`)