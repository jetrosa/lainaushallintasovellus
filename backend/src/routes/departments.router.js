const express = require('express');
const departmentsRouter = express.Router();
const { sequelize } = require("../../models/index");
const { ForbiddenError } = require("@casl/ability");

const Departments = sequelize.models.osastot

/**
 * Get all departments
 */
departmentsRouter.get("/", async (req, res) => {
    try {
        res.json(await Departments.findAll({}))
        console.log("Got departments from db.")
    } catch (error) {
        console.error(error)
        res.status(500).send("failed to get departments")
    }
})

/**
 * Get a department from db
 */
departmentsRouter.get("/:department_id", async (req, res) => {
    try {
        res.json(await Departments.findOne({
            where: { id: req.params.department_id }
        }))
        console.log("Got the requested department from db.")
    } catch (error) {
        console.error(error)
        res.status(500).send("failed to get the requested department")
    }
})

/**
 * New department
 */
departmentsRouter.post("/", async (req, res) => {
    try {
        ForbiddenError.from(req.ability).throwUnlessCan("manage");
        if (!("nimi" in req.body)) return res.status(400).send("Missing name")                    // VARCHAR(80)
        if (!("nimi_lyhenne" in req.body)) return res.status(400).send("Missing name abbreviation")
        // TODO: Tyyppien checkit lopuille muuttujille
        if (typeof req.body.nimi !== "string") return res.status(400).send("name must be string")
        // TODO: Pituuksien checkit lopuille muuttujille
        if ((req.body.nimi.length > 80)) return res.status(400).send("Too long name")
        if ((req.body.nimi.length < 1)) return res.status(400).send("Too short name")
        await Departments.create({
            nimi: req.body.nimi,
            nimi_lyhenne: req.body.nimi_lyhenne
        })
        res.json({
            "msg": "OK, added new department"
        })
    } catch (error) {
        console.error(error)
        if (error instanceof ForbiddenError) {
            res.status(403).send("Forbidden");
        } else
            res.status(500).send("failed to save department")
    }
})

module.exports = departmentsRouter;