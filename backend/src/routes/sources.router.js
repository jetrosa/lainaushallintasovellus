const express = require('express');
const sourcesRouter = express.Router();
const { sequelize } = require('../../models/index');
const { Transaction } = require("sequelize");
const { ForbiddenError } = require("@casl/ability");

const RadiationSources = sequelize.models.sateilylahteet;
const SourceNuclides = sequelize.models.lahteidennuklidit;
const Nuclides = sequelize.models.nuklidit;
const Loans = sequelize.models.lainat;
const SourceEdits = sequelize.models.lahdemuokkaukset;
const Users = sequelize.models.kayttajat;
const Departments = sequelize.models.osastot;

/**
 * Get a single source with its primary key
 */
sourcesRouter.get('/:id', async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const sourceid = req.params.id;
        console.log('Request Id:', req.params.id);
        const singleSource = await RadiationSources.findByPk(Number(sourceid))

        if (singleSource === null) {
            res.status(500).send("NULL VALUE: GET failed for source with id: " + sourceid)
        } else {
            res.json(singleSource)
        }

    } catch (error) {
        console.error(error);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        }
        else {
            res.status(500).send("ERROR: GET failed for source with id: " + sourceid)
        }
    }
});

/**
 * Get all sources from the given department, and almost all data associated with them
 */
sourcesRouter.get('/department/:department', async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const sourceDepartment = req.params.department;
        let allByDepartment;
        if (sourceDepartment == 1) {
            allByDepartment = await RadiationSources.findAll({
                include: [{
                    model: SourceNuclides,
                    include: { model: Nuclides }
                },
                {
                    model: Loans,
                    include: [{ model: Users, as: 'lainaaja' }, { model: Users, as: 'palauttaja' }]
                },
                {
                    model: SourceEdits,
                    include: { model: Users, as: 'muokkaaja' }
                },
                {
                    model: Users, as: 'vastuuhenkilo',
                    include: { model: Departments, as: 'osasto' }
                },
                {
                    model: Users, as: 'lisaaja',
                    include: { model: Departments, as: 'osasto' }
                },
                {
                    model: Users, as: 'poistaja',
                    include: { model: Departments, as: 'osasto' }
                },
                { model: Departments, as: 'vastuuosasto' }
                ]
            })
        }
        else {
            allByDepartment = await RadiationSources.findAll({
                where: { vastuuosasto_id: sourceDepartment },
                include: [{
                    model: SourceNuclides,
                    include: { model: Nuclides }
                },
                {
                    model: Loans,
                    include: [{ model: Users, as: 'lainaaja' }, { model: Users, as: 'palauttaja' }]
                },
                {
                    model: SourceEdits,
                    include: { model: Users, as: 'muokkaaja' }
                },
                {
                    model: Users, as: 'vastuuhenkilo',
                    include: { model: Departments, as: 'osasto' }
                },
                {
                    model: Users, as: 'lisaaja',
                    include: { model: Departments, as: 'osasto' }
                },
                {
                    model: Users, as: 'poistaja',
                    include: { model: Departments, as: 'osasto' }
                },
                { model: Departments, as: 'vastuuosasto' }
                ]
            })
        }

        if (allByDepartment === null) {
            res.status(500).send("NULL VALUE: GET failed for source with department: " + sourceDepartment);
        } else {
            console.log("Got samples from db with department: " + sourceDepartment);
            res.json(allByDepartment);
        }

    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("ERROR: GET failed for source with department: " + sourceDepartment)
    }
});

/**
 * Get all sources, and almost all data associated with them
 */
sourcesRouter.get("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        res.json(await RadiationSources.findAll({
            include: [{
                model: SourceNuclides,
                include: { model: Nuclides }
            },
            {
                model: Loans,
                include: [{ model: Users, as: 'lainaaja' }, { model: Users, as: 'palauttaja' }]
            },
            {
                model: SourceEdits,
                include: { model: Users, as: 'muokkaaja' }
            },
            {
                model: Users, as: 'vastuuhenkilo',
                include: { model: Departments, as: 'osasto' }
            },
            {
                model: Users, as: 'lisaaja',
                include: { model: Departments, as: 'osasto' }
            },
            {
                model: Users, as: 'poistaja',
                include: { model: Departments, as: 'osasto' }
            },
            { model: Departments, as: 'vastuuosasto' }
            ]
        }))
        console.log("Got samples from db.")
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to get sources")
    }
})

/**
 * Remove sample (but not from db)
 */
sourcesRouter.post("/remove-source/:source_id", async (req, res) => {
    try {
        console.log(req.params.source_id)
        console.log(req.body)
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        const result = await RadiationSources.update({
            poistettu_pvm: req.body.poistettu_pvm,
            poisto_syy: req.body.poisto_syy,
            poisto_tapa: req.body.poisto_tapa,
            poistajan_id: req.body.poistajan_id
        }, {
            where: { id: req.params.source_id }
        });
        res.json(result);
    } catch (error) {
        console.log(error);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send(error);
    }
})

/**
 * New sample
 */
sourcesRouter.post("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("modify");

        if (!req.body.kutsumanimi) return res.status(400).send("Missing name")                    // VARCHAR
        if (!req.body.viite_valmistaja) return res.status(400).send("Missing sample reference")   // VARCHAR
        if (!req.body.viite_stuk) return res.status(400).send("Missing sample internal reference")  // VARCHAR
        if (!req.body.lisatty_pvm) return res.status(400).send("Missing sample add date")      // DATE
        if (!req.body.parasta_ennen_pvm) return res.status(400).send("Missing best before")         // DATE
        if (!req.body.hankintatapa) return res.status(400).send("Missing procurement details")   // VARCHAR
        if (!req.body.sailytyspaikka) return res.status(400).send("Missing storage location")   // VARCHAR
        if (!req.body.sailytyspaikka_tarkenne) return res.status(400).send("Missing storage location details")    // VARCHAR
        if (!req.body.tyyppi) return res.status(400).send("Missing source type")             // VARCHAR   
        if (!req.body.vastuuhenkilo_id) return res.status(400).send("Missing person responsible for the radiation source")    // INT (FK)
        if (!req.body.lisaajan_id) return res.status(400).send("Missing addedByUser")            // INT (FK)
        if (!req.body.vastuuosasto_id) return res.status(400).send("Missing responsible department")       // INT (FK)

        // TODO: Tyyppien checkit lopuille muuttujille
        //if (typeof req.body.kutsumanimi !== "string") return res.status(400).send("name must be string")

        // TODO: Pituuksien checkit lopuille muuttujille
        if ((req.body.kutsumanimi.length > 80)) return res.status(400).send("Too long name")
        if ((req.body.viite_valmistaja.length > 255)) return res.status(400).send("Too long sample reference")

        if ((req.body.kutsumanimi.length < 1)) return res.status(400).send("Too short name")
        if ((req.body.viite_valmistaja.length < 1)) return res.status(400).send("Too short sample reference")

        /**
         * Allow null:  kutsumanimi, lisatiedot, poistettu_pvm, poisto_syy, poisto_tapa, umpi_luokituskoodi,
         *              umpi_erityismuotoisuus, umpi_erityismuotoisuus_pvm, umpi_erityismuotoisuus_todistus,
         *              avo_referenssi_tilavuus, avo_nykyinen_tilavuus, avo_koostumus, poistajan_id
         */
        await RadiationSources.create({
            kutsumanimi: req.body.kutsumanimi,
            viite_valmistaja: req.body.viite_valmistaja,
            viite_stuk: req.body.viite_stuk,
            viite_lahde_sertifikaatti: req.body.viite_lahde_sertifikaatti,
            lisatty_pvm: req.body.lisatty_pvm,
            parasta_ennen_pvm: req.body.parasta_ennen_pvm,
            hankintatapa: req.body.hankintatapa,
            lisatiedot: req.body.lisatiedot,
            sailytyspaikka: req.body.sailytyspaikka,
            sailytyspaikka_tarkenne: req.body.sailytyspaikka_tarkenne,
            poistettu_pvm: req.body.poistettu_pvm,
            poisto_syy: req.body.poisto_syy,
            poisto_tapa: req.body.poisto_tapa,
            viite_lahteen_lupaanvientiasiakirjaan: req.body.viite_lahteen_lupaanvientiasiakirjaan,
            viite_lahteen_luvastapoistoasiakirjaan: req.body.viite_lahteen_luvastapoistoasiakirjaan,
            tyyppi: req.body.tyyppi,
            umpi_luokituskoodi: req.body.umpi_luokituskoodi,
            umpi_erityismuotoisuus: req.body.umpi_erityismuotoisuus,
            umpi_erityismuotoisuus_pvm: req.body.umpi_erityismuotoisuus_pvm,
            umpi_erityismuotoisuus_todistus: req.body.umpi_erityismuotoisuus_todistus,
            avo_koostumus: req.body.avo_koostumus,
            avo_referenssi_tilavuus: req.body.avo_referenssi_tilavuus,
            avo_nykyinen_tilavuus: req.body.avo_nykyinen_tilavuus,
            referenssi_pvm: req.body.referenssi_pvm,
            lahteidennuklidits: req.body.lahteidennuklidit,
            // Foreign keys:
            vastuuhenkilo_id: req.body.vastuuhenkilo_id,
            vastuuosasto_id: req.body.vastuuosasto_id,
            lisaajan_id: req.body.lisaajan_id,
            poistajan_id: req.body.poistajan_id
        }, {
            include: [
                { model: SourceNuclides }
            ]
        })
        res.json({
            "msg": "OK, added new sample"
        })
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("Failed to save source, error msg:\n" + error.msg)
    }
})

sourcesRouter.post("/edit-source/:source_id", async (req, res) => {
    console.log("Editing source...")
    //const t = await db.transaction();

    try {
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        console.log(req.params.source_id);
        const sourceId = req.params.source_id;
        console.log(req.body);

        const newNuclides = req.body.lahteidennuklidits.map((nuclide) => (
            {
                nuklidi: nuclide.nuklidi,
                referenssi_aktiivisuus: nuclide.referenssi_aktiivisuus,
                nayte_id: parseInt(sourceId),
            }
        ));

        if (req.body.edit_count > 0) {
            const updateRadiationSourcesResult = await sequelize.transaction({
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            }, async (t) => {

                const updatedRadiationSource = await RadiationSources.update({
                    kutsumanimi: req.body.kutsumanimi,
                    viite_valmistaja: req.body.viite_valmistaja,
                    viite_stuk: req.body.viite_stuk,
                    viite_lahde_sertifikaatti: req.body.viite_lahde_sertifikaatti,
                    lisatty_pvm: req.body.lisatty_pvm,
                    parasta_ennen_pvm: req.body.parasta_ennen_pvm,
                    hankintatapa: req.body.hankintatapa,
                    lisatiedot: req.body.lisatiedot,
                    sailytyspaikka: req.body.sailytyspaikka,
                    sailytyspaikka_tarkenne: req.body.sailytyspaikka_tarkenne,
                    poistettu_pvm: req.body.poistettu_pvm,
                    poisto_syy: req.body.poisto_syy,
                    poisto_tapa: req.body.poisto_tapa,
                    viite_lahteen_lupaanvientiasiakirjaan: req.body.viite_lahteen_lupaanvientiasiakirjaan,
                    viite_lahteen_luvastapoistoasiakirjaan: req.body.viite_lahteen_luvastapoistoasiakirjaan,
                    tyyppi: req.body.tyyppi,
                    umpi_luokituskoodi: req.body.umpi_luokituskoodi,
                    umpi_erityismuotoisuus: req.body.umpi_erityismuotoisuus,
                    umpi_erityismuotoisuus_pvm: req.body.umpi_erityismuotoisuus_pvm,
                    umpi_erityismuotoisuus_todistus: req.body.umpi_erityismuotoisuus_todistus,
                    avo_koostumus: req.body.avo_koostumus,
                    avo_referenssi_tilavuus: req.body.avo_referenssi_tilavuus,
                    avo_nykyinen_tilavuus: req.body.avo_nykyinen_tilavuus,
                    referenssi_pvm: req.body.referenssi_pvm
                }, {
                    transaction: t,
                    where: { id: sourceId }
                });

                const createdEditEntry = await SourceEdits.create({
                    kommentti: req.body.edit_summary,
                    loki: req.body.edit_log,
                    muokkaus_pvm: new Date(),
                    muokkaaja_id: req.body.editor_id,
                    muokattu_nayte_id: sourceId
                }, {
                    transaction: t
                });

                const destroyedSourceNuclide = await SourceNuclides.destroy({
                    where: {
                        nayte_id: sourceId
                    }
                }, {
                    transaction: t
                });

                const createdSourceNuclides = await SourceNuclides.bulkCreate(
                    newNuclides,
                    {
                        transaction: t
                    });

                console.log(newNuclides);
                return [updatedRadiationSource, createdEditEntry, destroyedSourceNuclide, createdSourceNuclides];
            });
            res.json(updateRadiationSourcesResult);
        } else {
            console.log("No changes were made.")
            res.status(200).send("No changes were made...");
        }
    } catch (error) {
        console.log(error);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("Updating source was unsuccessful... Rolling back...")
    }

})

module.exports = sourcesRouter;