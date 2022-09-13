-- Testiadminin luonti tietokantakonttiin (kontin oltava päällä)
-- Käyttö terminaalissa projektikansion juuressa allaolevalla scriptillä: (-i <tietokantakontti dockerissa> -U <POSTGRES_USER> )
-- cat ./insertTestUser.sql | docker exec -i slk-postgres-db /bin/bash -c "PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER testdb"

INSERT INTO public.kayttajat (
etunimi, sukunimi, oikeustaso, sahkoposti, aktiivinen, osasto_id, kieku_id) VALUES (
'Anto'::character varying, 'Admini'::character varying, '1'::integer, 'testadmin@testadmin.fi'::character varying, '1'::integer, '1'::integer, 'admin'::character varying)
 returning id;