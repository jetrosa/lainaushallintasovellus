const express = require('express');
const sourceEditsRouter = express.Router();
const { sequelize } = require("../../models/index");
const { ForbiddenError } = require("@casl/ability");

const SourceEdits = sequelize.models.lahdemuokkaukset;
const RadiationSources = sequelize.models.sateilylahteet;

/**
 * Get a single edit with its primary key
 * PS. Not very useful
 */
sourceEditsRouter.get('/:id', async (req, res) => {
    const sourceEditId = req.params.id;
    console.log('Request Id:', req.params.id);
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const singleEditById = await SourceEdits.findByPk(Number(sourceEditId));

        if (singleEditById === null) {
            res.status(500).send("NULL VALUE: GET failed for source edit with id: " + sourceEditId);
        } else {
            res.json(singleEditById);
        }

    } catch (error) {
        console.error(error);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        }
        res.status(500).send("ERROR: GET failed for source edit with id: " + sourceEditId);
    }
});

/**
 * Get all edits for a specific source
 */
sourceEditsRouter.get('/:source_id/history', async (req, res) => {
    console.log("There was an attempt...");
    const sourceid = req.params.source_id;
    console.log(`Source request id: ${sourceid}`);
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        const allEditsBySourceId = await SourceEdits.findAll({
            where: { muokattu_nayte_id: sourceid },
            include: [{ model: RadiationSources }]
        })
        if (allEditsBySourceId === null) {
            res.status(500).send(`Request for edits of source with id: ${sourceid} returned null`)
        } else {
            console.log(allEditsBySourceId);
            res.json(allEditsBySourceId);
        }
    } catch (error) {
        console.log(`Error on retrieving history for source with id: ${sourceid}, error msg:\n${error}`);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        }
        res.status(500).send(`Error on retrieving history for source with id: ${sourceid}`);
    }
})

/**
 * Get all source edits
 */
sourceEditsRouter.get("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        res.json(await SourceEdits.findAll({}))
        console.log("Got source edits from db.")
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        }
        res.status(500).send("Failed to get source edits...")
    }
})


/**
 * New edit to source
 */
sourceEditsRouter.post("/", async (req, res) => {
    if (!("muokkaus_pvm" in req.body)) return res.status(400).send("Missing date for edit. This one should be added automatically")    // VARCHAR
    if (!("muokkaaja_id" in req.body)) return res.status(400).send("Missing id of user who made the edit.")            // INT (FK)
    if (!("muokattu_nayte_id" in req.body)) return res.status(400).send("Missing id of the source being edited.")       // INT (FK)
    if ((req.body.kommentti.length > 1000)) return res.status(400).send("Comment too long. Max 1000 characters.")

    try {
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        /**
         * Allow null:  kommentti
         */
        await SourceEdits.create({
            kommentti: req.body.kommentti,
            muokkaus_pvm: req.body.muokkaus_pvm,
            // Foreign keys:
            muokkaaja_id: req.body.muokkaaja_id,
            muokattu_nayte_id: req.body.muokattu_nayte_id
        })
        res.json({
            "msg": "OK, added new source edit"
        })
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("Failed to save source edit: " + error.msg)
    }
})

module.exports = sourceEditsRouter;