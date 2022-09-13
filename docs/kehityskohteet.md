# Kehityskohteet
Päivitetty 15.12.2021

Pienempiä ja suurempia puutteita ja kehityskohteita, joita tullut tapaamisissa esiin tai muuten tullut mieleen kehityksen aikana.

## Yleisesti
- ssl/https - verkkoliikenne on suurelta osin dockerin sisäisessä verkossa, mutta sertifikaatteja/ssl-yhteyksiä ei ole mihinkään väliin toteutettu
- podman dockerin tilalla - suunniteltu korvaaja/vaihtoehto? ei ole testattu. dockertiedostot/palveluimaget mahdollisesti toimivia sellaisenaan, composea voi joutua muokkaamaan
- ajastettu varmuuskopiointi tietokannalle (cron) huom: voidaan käyttää hostin cronia, josta yhteys dockeriin `docker exec` -komennolla TAI `cron dockerin sisällä` TAI `pg_cron extension` postgres-imageen lisättynä (ei suoraan mukana Dockerin virallisessa default-imagessa). varmuuskopio kontin volumesta tai pg_dump
- testiympäristö/automaattiset testit esim. Jenkins Dockerissa
- apin dokumentointi

## Oikeushallinta - oman yksikön ulkopuoliset lisäoikeudet
- oikeushallinta - erillisoikeudet muihin yksiköihin (nyt oman osaston sisäinen oikeustaso käyttäjätaulussa, sen perusteella määritellään myös frontin näkymä)
- lisäoikeuksia varten voisi olla uusi tietokantataulu, jossa kaikki käyttäjille annetut lisäoikeudet
- columnit esim:
    - `<yksikkö> - <käyttäjä> - <oikeustaso>`, joista kaikki ovat `FK` ja yhdistelmänä `'unique'`
    - `<luvan antajan id (FK)>`
    - `<päivä jolloin lupa myönnetty>`
    - `<luvan päättymispäivä>`
- käyttäjän pitäisi nähdä omat lisäoikeutensa frontin ui:ssa
- oikeuksille pitäisi olla myös hallintapaneeli (paneeli näkyisi adminilla ja muokkauskäyttäjällä?)
- Mahdollisesti voisi miettiä myös tikettijärjestelmää luvan hakemisessa (käyttäjä voisi tehdä lisäoikeuspyynnön järjestelmään)

## Muu toiminnallisuus front- ja backend
- adminpaneeli(front) - käyttäjän lisäys (nyt vain muokkaus, käyttäjät luodaan automaattisesti ensimmäisellä kirjautumiskerralla) + apin toiminnallisuus
- adminpaneeli(front) - yksikön lisäys + apin toiminnallisuus
- aktiivinen-kenttä käyttäjätaulussa tietokannassa (käyttöön tai poisto? nyt alin oikeustaso poistaa käytännössä kaikki oikeudet)
- lokien keräys (mitä kerätään ja mihin tallennetaan?)
- lomakekenttien tarkistukset - frontin puolella muototarkistuksia (pakolliset kentät ym.) ennen kuin lomakkeen lähetys mahdollinen
- lomakekenttien tarkistukset - lisää tarkennuksia virheiden aiheuttajiin/viesteihin apissa
- lomakekenttien tarkistukset - kootaan kaikki ongelmat kerralla apin responseen
- sähköpostimuistutukset vanhenevista/myöhästyneistä lainoista
- käytössä olevan kielen näkyminen kielivalikossa ennen valintaa
- Lähdeluettelon URL linkit vaihdettava toimiviin OneSamplePopup.js tiedostossa "specialPermitsBox"-kohdassa sekä "specialSourceType"-kohdassa (myös mahd. props.sample.viite_lahde_sertifikaatti? (rivi 356 kirjoittamisen hetkellä)).
<br><br>

## EXTRA - kirjanpito muille kohteille
Yleiskäyttöisen pohjan suunnittelu/pohja kirjanpitosovellusten tekoon myös muulle sisällölle. Toiveena olisi generointityökalu, josta saisi sovelluspohjan ulos parametrien perusteella (käytännössä haastava toteuttaa, helpompaa olisi rakentaa sovelluksen
yksinkertaistettu pohjamalli ja muokkausohjeet, joilla sovelluksen saisi tehtyä helposti valmiiksi). "Erikoistoiminnallisuudet", kuten oikeushallintasäännöt, puoliintumisajat, käyttäjäystävälliset virheilmoitukset ym. vaativat joka tapauksessa erillisen kehittämisen.

Pitää suunnitella tietokantarakenteet ja api uusiksi (ei tutustuttu, mutta esimerkiksi apipohjan generoimiseen tietokantamallista on olemassa työkaluja), frontista voisi hyödyntää runkoa (aloitussivutoiminnot, navbar, adminpaneeli, oikeusmääritykset, ostoskori). Hyödynnettävissä myös docker-composen toiminnallisuus/dockerissa toimiva palvelukokonaisuus.

Todennäköisesti siistein toteutus tulisi luomalla uusi projekti ja siirtämällä siihen toiminnallisuuksia nykyisestä.