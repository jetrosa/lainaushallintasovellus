const express = require('express');
const nuclideRouter = express.Router();
const { sequelize } = require("../../models/index");
const { ForbiddenError } = require("@casl/ability");

const Nuclides = sequelize.models.nuklidit

/**
 * Get all half lifes
 */
nuclideRouter.get("/", async (req, res) => {
    try {
        res.json(await Nuclides.findAll({}))
        console.log("Got nuclides from db.")
    } catch (error) {
        console.error(error)
        res.status(500).send("failed to get nuclides")
    }
})

/**
 * New half life
 */
nuclideRouter.post("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        if (!("nuklidi" in req.body)) return res.status(400).send("Missing name")                    // VARCHAR(80)

        // TODO: Tyyppien checkit lopuille muuttujille
        if (typeof req.body.nuklidi !== "string") return res.status(400).send("name must be string")

        // TODO: Pituuksien checkit lopuille muuttujille
        if ((req.body.nuklidi.length > 80)) return res.status(400).send("Too long name")
        if ((req.body.nuklidi.length < 1)) return res.status(400).send("Too short name")
        await Nuclides.create({
            nuklidi: req.body.nuklidi,
            puoliintumisaika: req.body.puoliintumisaika
        })
        res.json({
            "msg": "OK, added new nuclide"
        })
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to save nuclide")
    }
})

nuclideRouter.post("/edit-nuclide/:nuklidi", async (req, res) => {
    try {
        console.log(req.params.nuklidi)
        console.log(req.body)
        ForbiddenError.from(req.ability).throwUnlessCan("modify");
        const result = await Nuclides.update({
            puoliintumisaika: req.body.puoliintumisaika,
        }, {
            where: { nuklidi: req.params.nuklidi }
        });
        res.json(result);
    } catch (error) {
        console.log(error);
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to edit nuclide");
    }
})

module.exports = nuclideRouter;