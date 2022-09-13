const express = require('express');
const sourceNuclidesRouter = express.Router();
const { sequelize } = require("../../models/index");
const { ForbiddenError } = require("@casl/ability");

const SourceNuclides = sequelize.models.lahteidennuklidit;
const RadiationSources = sequelize.models.sateilylahteet;

/**
 * Get all nuclides
 */
sourceNuclidesRouter.get("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        res.json(await SourceNuclides.findAll({}));
        console.log("All nuclides for sources fetched");
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) res.status(403).send("Forbidden");
        res.status(500).send("Failed to fetch nuclides for sources");
    }
})

/**
 * Get all nuclides by source id, aka. "nayte_id"
 */
sourceNuclidesRouter.get("/:source_id/nuclides", async (req, res) => {
    const sourceid = req.params.source_id;
    console.log(`Request for nuclides with source id of: ${sourceid}`);
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const sourceNuclideSources = await SourceNuclides.findAll({
            where: { nayte_id: sourceid },
            include: [{ model: RadiationSources }]
        })
        if (sourceNuclideSources === null) {
            console.log(`NULL value returned for source id: ${sourceid}`);
            res.status(500).send(`Unable to find source nuclides for source with id: ${sourceid}`);
        } else {
            console.log(sourceNuclideSources);
            res.json(sourceNuclideSources);
        }
    } catch (error) {
        console.log(`An error occured, error msg: ${error.msg}`);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send(`An error occured while trying to find source nuclides for source with id: ${sourceid}`);
    }
})


/**
 * Get one nuclide by id
 * PS. Probably not very useful
 */
sourceNuclidesRouter.get('/:id', async (req, res) => {
    const nuclideid = req.params.id;
    console.log('Request Id:', req.params.id);
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const singleNuclide = await SourceNuclides.findByPk(Number(nuclideid))

        if (singleNuclide === null) {
            res.status(500).send("NULL VALUE: GET failed for source_nuclide with id: " + nuclideid)
        } else {
            res.json(singleNuclide)
        }
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("ERROR: GET failed for source_nuclide with id: " + nuclideid)
    }
});

/**
 * Add nuclide
 */
sourceNuclidesRouter.post("/", async (req, res) => {
    // TODO: Tarkista arvojen oikeellisuus

    try {
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        if (!("referenssi_aktiivisuus" in req.body)) return res.status(400).send("Missing referenssi_aktiivisuus")  // DOUBLE PRECISION
        if (!("nuklidi" in req.body)) return res.status(400).send("Missing nuclide")  // VARCHAR (FK)
        if (!("nayte_id" in req.body)) return res.status(400).send("Missing reference to source id")  // VARCHAR (FK)
        await SourceNuclides.create({
            referenssi_aktiivisuus: req.body.referenssi_aktiivisuus,
            // Foreign keys
            nuklidi: req.body.nuklidi,
            nayte_id: req.body.nayte_id
        })
        res.json({
            "msg": "Lähteelle lisätty nuklidi onnistuneesti"
        })
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("Virhe lisättäessä lähteelle nuklidia")
    }
})

module.exports = sourceNuclidesRouter;