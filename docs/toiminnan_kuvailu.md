# Käyttöohjeet/Kuvailu sivun toiminnasta

## Ensimmäinen kirjautuminen & rekisteröinti

- Käyttäjä ohjataa ensimmäisen kirjautumisen jälkeen rekisteröintisivulle. Siellä käyttäjä asettaa käyttäjätilille nimen ja sähköpostin.
- Kun tiedot on annettu, ohjataan käyttäjä "nollaoikeussivulle". Tämä johtuu siitä, että käyttäjällä on ensin vain vierasoikeudet. Sivu ilmoittaa, että se odottaa katseluoikeuksia.

## Oikeudet

### Oikeuksien ja käyttäjätietojen muokkaaminen (Adminsivu)

- Admin-oikeudellinen käyttäjä pystyy muokkaamaan muiden käyttäjien tietoja sekä oikeuksia adminsivulla.
- Adminsivulle pääsee navigaatiopalkissa oikeassa reunassa sijaitsevasta "Admin"-painikkeesta.
- Admin pystyy muokkaamaan käyttäjien nimeä, sähköpostia, yksikköä sekä oikeustasoa. Yksittäisen käyttäjän tietoja muokataan painamalla oikealla sijaitsevasta kynä-kuvakkeesta.

### Oikeustasot ja yksiköt

- Admin-oikeudellinen käyttäjä voi asettaa käyttäjälle yhden viidestä oikeustasosta:

  - `admin`
  - `muokkaaja`
  - `lainaaja`
  - `katselija`
  - `vieras`
    <br><br>

- Muokkaajalla on kaikki lainaajan ja katselijan oikeudet jne...
- Käyttäjälle asetetaan myös yksikkö, joka määrittää minkä yksikön/yksiköiden lähteitä käyttäjä pystyy käyttämään.
  - Esimerkiksi käyttäjä, jolle on asetettu KET yksikkö, pystyy käyttämään vain KET-yksikön lähteitä.
  - VALO-yksikkö eroaa muista yksiköistä siten, että yksikkö antaa oikeudet jokaisen yksikön lähteisiin.

## Lähteet ja lainaaminen

### Lähdeluettelo

- Lähdeluettelossa käyttäjä näkee listan säteilylähteistä.
  - Lisätietoa yksittäisestä lähteestä saa painamalla lähdettä taulukossa, tai laajemmin oikealta i-kuvakkeesta.
- Muokkaaja-oikeudellinen käyttäjä pystyy lainaamisen lisäksi myös muokkaamaan lähteiden tietoja painamalla.oikealla sijaitsevasta kynä-kuvakkeesta sekä poistamaan lähteitä roskakori-kuvakkeesta.

### Lainaaminen

- Lainaaja-oikeudellinen pystyy lainaamaan lähteitä painamalla ostoskärryjen kuvaa oikealla "actions"-solussa.
- Lähde siirtyy ostoskoriin, joka näkyy navigaatiopalkissa.
- Ostoskorista käyttäjä siirtyy loanconfirmation sivulle, jossa asetetaan arvioitu palautuspäivä, sekä lisätietoja lainauksesta.
- Lainatut lähteet sekä lainahistorian käyttäjä näkee "Loans"/"Lainat" sivulta.
  - Admin-oikeudellinen näkee tällä sivulla myös muiden käyttäjien lainatut lähteet.

## Muuta

Muuta-dropdown

- Navigaatiopalkissa "Other"/"Muuta" dropdown-valikosta käyttäjä löytää mahdollisuuden lisätä lähteitä.
  - Samasta valikosta löytyy myös linkki nuklidiluetteloon.

### Kielen vaihtaminen

Sivuston kielen vaihtaminen onnistuu navigaatiopalkissa oikeassa reunassa sijaitsevasta valikosta.
