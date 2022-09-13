Päivitetty 13.12.2021

# Autentikaatio ja autorisaatio

Frontin käyttö vaatii autentikoidun session olemassaolon apiserverillä.
Sessio muodostetaan, kun apiserverin `'/api/login'` saa kutsun, jossa käyttäjätunnus headerina `X-REMOTE-USER`.
Tämä kutsu käytännössä mahdollinen vain apache-proxyn kautta, joka käsittelee kirjautumisen (apiserveri ei julkinen, yhteys vain
Docker composen sisällä).
Jos `REMOTE-USER` -käyttäjää ei löydy tietokannasta, luodaan automaattisesti uusi käyttäjä vierasoikeuksilla.

Apiserverin verkko on rajattu Dockerin sisällä, yhteys vain dockerin composen muista palveluista,
mutta ei suoraan nginx/frontista (frontin yhteys apiserveriin apacheserverin kautta).

Oikeudet toimintoihin (frontin näkymä ja oikeus suorittaa apikutsuja) määrittyvät käyttäjän 
oikeustason ja osaston perusteella. Nämä haetaan tietokannasta loginin yhteydessä. Frontille välitetään
tiedot oikean näkymän muodostamiseksi (kirjautunut vieras pääsee täydentämään omia tietojaan ja päätyy odotussivulle, 
oikea käyttö onnistuu vasta kun admin on korottanut oikeustasoa). Apiserveri tarkistaa kutsujen oikeudet erikseen (vertaa 
tietokannasta haettua oikeustasoa casl-moduulilla määriteltyihin oikeuksiin).

# Backendin moduulit autentikaatiossa ja autorisaatiossa:

- `passport` - autentikaation/session käyttö
- `passport-custom` - oman autentikaatiostrategian määritykseen
- `express-session` - sessio perustoiminnallisuus)
- `memorystore` - sessiotiedot serverillä muistissa (käyttäjän auth-tiedot), vanhentuneiden sessioiden siivous
- `CASL` (`"@casl/ability"`) - apireitteihin alkuun lisättävä ehto, oikeustason perusteella tarkistetaan onko toiminto sallittu)
<br><br>

## CASL-oikeushallinta backend

Casl konfigurointi ja oikeussäännöt kansiossa `'backend/authz'`

Esimerkki Casl-oikeustarkistuksesta apireitin yhteydessä:

```
ForbiddenError.from(req.ability).throwUnlessCan("modify");

catch (error) {
    if (error instanceof ForbiddenError) {
        res.status(403).send("Forbidden");
}
```
<br>

# Frontend:

- `CASL` (`"@casl/ability"`, `"@casl/react"`) - CASL-komponentissa määritellään miten backendiltä vastaanotettu oikeustaso vaikuttaa 
näkymiin/sivustoon joka käyttäjälle välitetään)

## CASL-oikeushallinta frontend
Frontin CASL-oikeusmääritykset komponentissa `'client/src/components/Ability.js'`

Käyttöehtoesimerkki:
`CheckAbility('modify', 'all')`