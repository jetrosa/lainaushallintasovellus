const express = require('express');
const usersRouter = express.Router();
const { sequelize } = require("../../models/index");
const { ForbiddenError } = require("@casl/ability");

const Kayttajat = sequelize.models.kayttajat
const Oikeustasot = sequelize.models.oikeustasot

/**
 * Get all users from db
 */
usersRouter.get("/", async (req, res) => {
    try {
        //ForbiddenError.from(req.ability).throwUnlessCan("manage");
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        res.json(await Kayttajat.findAll({ include: ['osasto', Oikeustasot] }))
        console.log("Got users from db.")
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to get users")
    }
})

/**
 * Get a user from db
 */
usersRouter.get("/:user_id", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("read");
        res.json(await Kayttajat.findOne({
            where: { id: req.params.user_id }
        }))
        console.log("Got the requested user from db.")
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to get the requested user")
    }
})

usersRouter.patch("/selfregister/", async (req, res) => {
    console.log(req.body);
    try {
        await Kayttajat.update({
            etunimi: req.body.etunimi,
            sukunimi: req.body.sukunimi,
            sahkoposti: req.body.sahkoposti,

        }, { where: { id: req.user.id } }
        )
        res.json({
            "msg": "Käyttäjät päivitetty"

        })
    } catch (error) {
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else {
            res.status(500).send("Virhe käyttäjien päivityksessä")
        }
    }
})

/**
 * update users
 */
usersRouter.patch("/:index", async (req, res) => {
    console.log(req.body);
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("manage");
        await Kayttajat.update({
            etunimi: req.body.etunimi,
            sukunimi: req.body.sukunimi,
            aktiivinen: req.body.aktiivinen,
            oikeudet_admin: req.body.oikeudet_admin,
            sahkoposti: req.body.sahkoposti,
            osasto_id: req.body.osasto_id,
            oikeustaso: req.body.oikeustaso,
            kieku_id: req.body.kieku_id,
        }, { where: { id: req.params.index } }
        )
        res.json({
            "msg": "Käyttäjät päivitetty"
        })
    } catch (error) {
        console.error(error)
        res.status(500).send("Virhe käyttäjien päivityksessä")
    }
})

module.exports = usersRouter;