# Ympäristön asennus VM/Docker
- Kirjoitettu Win10 (Host) → Ubuntu 20.10 (VM) mielessä
- vaihtoehtoisesti Docker Desktop for Windows, ohjeet tiedostossa asennus_docker_win.md

## Perusta: VM & VSCode
- Asenna Virtualbox ja luo uusi Ubuntu VM
- Päivitä Ubuntu: "`sudo apt update && sudo apt upgrade`"
- Asenna VSCode koneelle, jolla haluat editoida koodia
- Avaa VSCode ja asenna 'Remote - SSH'-plugin

## VM: Vaaditut lisäosat
- Aja "`sudo apt update`" (kannattavaa ajaa ennen jokaisen palikan asennusta)
- Asenna curl: "`sudo apt install curl`"
- Asenna git: "`sudo apt install git`"
- Asenna SSH: "`sudo apt install openssh-server`" ja tarkista status: "`sudo systemctl status sshd`"
- Asenna nodejs ja npm: "`curl -fsSL https://deb.nodesource.com/setup_15.x | sudo -E bash -`" → "`sudo apt-get install -y nodejs`"
- Tässä vaiheessa olisi varmaan hyvä käynnistää virtuaalikone uudestaan varmuuden vuoksi

## VM: Docker-Engine & Docker-Compose
### Asenna Docker-Engine (https://docs.docker.com/engine/install/ubuntu/)
- Asenna vaaditut lisäosat: "`sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common`"
- Aja "`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`"
- Aja "`sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"`"
- Muista päivittää repot: "`sudo apt-get update`"
- Asennus: "`sudo apt-get install docker-ce docker-ce-cli containerd.io`"
- Halutessaan voi testata toimivuuden: "`sudo docker run hello-world`"

### Asenna Docker-Compose (https://docs.docker.com/compose/install/)
- Lataa paketti: "`sudo curl -L "https://github.com/docker/compose/releases/download/1.28.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`"
- Anna sille suoritusoikeudet: "`sudo chmod +x /usr/local/bin/docker-compose`"
### Docker hienosäätöä
#### Docker-Compose auto-completion komennoille (https://docs.docker.com/compose/completion/)
- Aja "`sudo curl -L https://raw.githubusercontent.com/docker/compose/1.28.4/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose`"
#### Docker ei vaadi sudo oikeuksia (https://docs.docker.com/engine/install/linux-postinstall/)
- Käytetään ainoastaan devausvaiheessa
- Luo ryhmä: "`sudo groupadd docker`"
- Lisää käyttäjä ryhmään: "`sudo usermod -aG docker $USER`"
- Päivitä ryhmät: "`newgrp docker`" tai kirjaudu ulos ja takaisin sisään.
- Voit halutessasi testata toimivuuden: "`docker run hello-world`"
#### Käynnistä Docker VM:n käynnistyessä (https://docs.docker.com/engine/install/linux-postinstall/)
- Aja "`sudo systemctl enable docker.service`" ja "`sudo systemctl enable containerd.service`"
## Port-forwarding
### SSH
- Aseta SSH:lle port forwarding VirtualBox:ssa (Virtuaalikoneen Settings → Network → Advanced → Port Forwarding → Lisää uusi sääntö): Host port: `2222`, Guest port: `22`
### Muut
- Eivät pakollisia, mutta hyödyllisiä, jos haluaa testata Host-koneella
- 1:1 sääntöjä, jos eivät ole host koneella jo käytössä
- Vaaditut portit löytyvät `docker-compose.yml`-tiedostosta
- Portit (kirjoitushetkellä): `80`, `3001`, `8080` ja `9999` (avattuna dockerin ulkopuolelle vain portti 80/nginx front)
## Käynnistys
### Prerequisites
- VS Codella remote sessio auki virtuaalikoneeseen (Remote Explorer välilehdessä): "`ssh käyttäjä@localhost -p 2222`"
- Hae koodit gitistä: "`git clone https://gitlab.com/l_uo/innoprojekti.git`" (huom. viimeisin haara ei välttämättä master)
- Mene projektikansioon ja aja "`backend`" ja "`client`" alakansioissa "`npm install`"
### Konttien käynnistys
- Aja "`docker-compose build`" projektin juuressa
- Tämän jälkeen aja "`docker-compose up`"
- Testaa toimiiko menemällä `http://localhost/`-osoitteeseen (PS. portti 80 ei saa olla esim. Apache-palvelun käytössä)
### Yhteys tietokantaan PgAdminilla
- Mene selaimella osoitteeseen `http://localhost:8080` ja kirjaudu sisään pgadminiin (kirjautumistiedot löytyvät `docker-compose.yml`-tiedostosta)
- Luo uusi serveri (yhteys olemassaolevaan tietokantaan): Add New Server → Name: *vapaavalintainen* → Connection-tab → Host name/address: `slk-postgres-db`, Port: `5432`, Username: `postgres`, Password: `postgres` (tunnusasetusten muuttaminen "`backend/config/config.js`"-tiedostosta(NODE_ENV!=production) ja `docker-compose.yml`(NODE_ENV=production))
- Serverin tulisi olla tämän jälkeen luotu ja tarkastellessaan siitä tulisi löytyä kaksi tietokantaa valmiiksi luotuna; `postgres` (maintenance db) ja `testdb` (pää-asiallinen tietokanta)
#### Tämän jälkeen tulisi kaikkien palveluiden olla pystyssä ja menemällä osoitteeseen `http://localhost/` tulisi sisäänkirjautumisikkunan avautua.

<br/><br/>

## Muita vinkkejä
### Pikatestaus
- pgAdminissa voit ajaa `"test_data/db/testdata_*.sql"` -tiedostosta löytyvän SQL-pyynnön, joka lisää jonkin verran testidataa tietokantaan. HUOM! Resetoi samalla koko tietokannan.

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

- Konttien pysäytys ja poisto onnistuu myös Docker for Windows käyttöliittymän kautta, konttien kohdalta löytyy painikkeina stop ja remove.
Huom: Volumet ovat erillisiä konteista, poistetaan tarvittaessa Dockerin Volumes-sivulla.