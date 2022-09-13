CREATE TABLE Nuklidit
(
  nuklidi VARCHAR(20) NOT NULL,
  puoliintumisaika DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (nuklidi)
);

CREATE TABLE Osastot
(
  id SERIAL NOT NULL,
  nimi VARCHAR(80),
  nimi_lyhenne VARCHAR(10) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (nimi_lyhenne)
);

CREATE TABLE Oikeustasot
(
  id INT NOT NULL,
  nimi VARCHAR(40) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Kayttajat
(
  id SERIAL NOT NULL,
  etunimi VARCHAR(40) NOT NULL,
  sukunimi VARCHAR(40) NOT NULL,
  oikeustaso INT NOT NULL,
  sahkoposti VARCHAR(80) NOT NULL,
  aktiivinen INT NOT NULL,
  osasto_id INT NOT NULL,
  kieku_id VARCHAR(40) UNIQUE,

  PRIMARY KEY (id),
  FOREIGN KEY (osasto_id) REFERENCES Osastot(id),
  FOREIGN KEY (oikeustaso) REFERENCES Oikeustasot(id)
);

CREATE TABLE Sateilylahteet
(
  id SERIAL NOT NULL,
  kutsumanimi VARCHAR(80),
  viite_valmistaja VARCHAR(80) NOT NULL,
  viite_stuk VARCHAR(80) NOT NULL,
  viite_lahde_sertifikaatti VARCHAR(60),
  lisatty_pvm DATE,
  parasta_ennen_pvm DATE,
  hankintatapa VARCHAR(200) NOT NULL,
  lisatiedot VARCHAR(2000),
  poistettu_pvm DATE,
  sailytyspaikka VARCHAR(100) NOT NULL,
  sailytyspaikka_tarkenne VARCHAR(100) NOT NULL,
  poisto_syy VARCHAR(500),
  poisto_tapa VARCHAR(80),
  umpi_luokituskoodi VARCHAR(40),
  umpi_erityismuotoisuus VARCHAR(20),
  umpi_erityismuotoisuus_pvm DATE,
  umpi_erityismuotoisuus_todistus VARCHAR(255),
  avo_referenssi_tilavuus DOUBLE PRECISION,
  avo_nykyinen_tilavuus DOUBLE PRECISION,
  viite_lahteen_lupaanvientiasiakirjaan VARCHAR(60),
  viite_lahteen_luvastapoistoasiakirjaan VARCHAR(60),
  tyyppi VARCHAR(24) NOT NULL,
  referenssi_pvm TIMESTAMP WITH TIME ZONE NOT NULL,
  avo_koostumus VARCHAR(24),
  vastuuhenkilo_id INT NOT NULL,
  vastuuosasto_id INT NOT NULL,
  lisaajan_id INT NOT NULL,
  poistajan_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (vastuuhenkilo_id) REFERENCES Kayttajat(id),
  FOREIGN KEY (vastuuosasto_id) REFERENCES Osastot(id),
  FOREIGN KEY (lisaajan_id) REFERENCES Kayttajat(id),
  FOREIGN KEY (poistajan_id) REFERENCES Kayttajat(id)
);

CREATE TABLE LahteidenNuklidit
(
  id SERIAL NOT NULL,
  referenssi_aktiivisuus DOUBLE PRECISION NOT NULL,
  nuklidi VARCHAR(20) NOT NULL,
  nayte_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (nuklidi) REFERENCES Nuklidit(nuklidi),
  FOREIGN KEY (nayte_id) REFERENCES Sateilylahteet(id)
);

CREATE TABLE Lainat
(
  id SERIAL NOT NULL,
  voimassa INT NOT NULL,
  lainaus_pvm DATE NOT NULL,
  arvioitu_palautus_pvm DATE,
  lopullinen_palautus_pvm DATE,
  lainaus_syy VARCHAR(1000) NOT NULL,
  sailytys_tiedot VARCHAR(1000) NOT NULL,
  avo_palautettu_tilavuus DOUBLE PRECISION,
  nayte_id INT NOT NULL,
  lainaaja_id INT NOT NULL,
  palauttajan_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (nayte_id) REFERENCES Sateilylahteet(id),
  FOREIGN KEY (lainaaja_id) REFERENCES Kayttajat(id),
  FOREIGN KEY (palauttajan_id) REFERENCES Kayttajat(id)
);

CREATE TABLE LahdeMuokkaukset
(
  id SERIAL NOT NULL,
  kommentti VARCHAR(1000),
  loki VARCHAR(3000),
  muokkaus_pvm DATE NOT NULL,
  muokkaaja_id INT NOT NULL,
  muokattu_nayte_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (muokkaaja_id) REFERENCES Kayttajat(id),
  FOREIGN KEY (muokattu_nayte_id) REFERENCES Sateilylahteet(id)
);
