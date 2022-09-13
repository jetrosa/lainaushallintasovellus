const express = require('express');
const { sequelize } = require('../../models/index');
const loanedSamplesRouter = express.Router();
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
 * Get all loaned samples/loans
 */
loanedSamplesRouter.get("/", async (req, res) => {
	try {
		ForbiddenError.from(req.ability).throwUnlessCan("read");
		const usersLoanedSamples = await Loans.findAll({
			where: {
				voimassa: 1
			},
			order: [['arvioitu_palautus_pvm', 'ASC']],
			include: [{
				model: RadiationSources,
				include: [{
					model: SourceNuclides,
					include: { model: Nuclides }
				},
				{
					model: Loans,
					include: [{ model: Users, as: 'lainaaja' },
					{ model: Users, as: 'palauttaja' }]
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
			}
			]
		});
		res.json(usersLoanedSamples);
	} catch (error) {
		console.error(error);
		if (error instanceof ForbiddenError) {
			res.status(403).send("Forbidden");
		}
		res.status(500).send("failed to get loanedsamples");
	}
})

/**
 *  Get all on-going loans for the user, with associated information
 */
loanedSamplesRouter.get("/:lainaaja_id", async (req, res) => {
	console.log(req.params);
	try {
		ForbiddenError.from(req.ability).throwUnlessCan("read");
		const usersLoanedSamples = await Loans.findAll({
			where: {
				lainaaja_id: req.params.lainaaja_id,
				voimassa: 1
			},
			order: [['arvioitu_palautus_pvm', 'ASC']],
			include: [{
				model: RadiationSources,
				include: [{
					model: SourceNuclides,
					include: { model: Nuclides }
				},
				{
					model: Loans,
					include: [{ model: Users, as: 'lainaaja' },
					{ model: Users, as: 'palauttaja' }]
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
			}
			]
		});
		console.log(usersLoanedSamples);
		res.json(usersLoanedSamples);
	} catch (error) {
		console.error(error);
		if (error instanceof ForbiddenError) {
			res.status(403).send("Forbidden");
		}
		res.status(500).send("failed to get loanedsamples");
	}
})

loanedSamplesRouter.get("/history/:lainaaja_id", async (req, res) => {
	try {
		ForbiddenError.from(req.ability).throwUnlessCan("read");
		const usersLoanHistory = await Loans.findAll({
			where: {
				lainaaja_id: req.params.lainaaja_id,
				voimassa: 0
			},
			order: [['lopullinen_palautus_pvm', 'DESC']],
			include: [{
				model: RadiationSources,
				include: [{
					model: SourceNuclides,
					include: { model: Nuclides }
				},
				{
					model: Loans,
					include: [{ model: Users, as: 'lainaaja' },
					{ model: Users, as: 'palauttaja' }]
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
			}
			]
		});
		res.json(usersLoanHistory);
	} catch (error) {
		console.error(error);
		if (error instanceof ForbiddenError) {
			res.status(403).send("Forbidden");
		}
		res.status(500).send("failed to get loanedsamples");
	}
})

loanedSamplesRouter.post("/checkLoanStatus", async (req, res) => {
	try {
		ForbiddenError.from(req.ability).throwUnlessCan("read");
		const checkLoaned = await Loans.findAll({
			where: {
				nayte_id: req.body.map(loan => loan.nayte_id),
				voimassa: 1
			}
		});
		res.send(checkLoaned);
	} catch (error) {
		if (error instanceof ForbiddenError) {
			res.status(403).send("Forbidden");
		}
		res.status(500).send("could not check loan status");
	}
})

loanedSamplesRouter.post("/loan", async (req, res) => {
	const reqDates = req.body.map(loan => (
		{
			lainaus_pvm: new Date(),
			...loan
		}));

	try {
		ForbiddenError.from(req.ability).throwUnlessCan("loan");
		const result = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
		}, async (t) => {
			const checkLoaned = await Loans.findAll({
				where: {
					nayte_id: req.body.map(loan => loan.nayte_id),
					voimassa: 1
				},
				include: [{ model: RadiationSources }]
			}, { transaction: t });

			if (checkLoaned.length > 0) {
				return { alreadyLoaned: true, loans: checkLoaned };

			} else {
				const bulk = await Loans.bulkCreate(reqDates, { transaction: t });
				return { alreadyLoaned: false, loans: bulk };
			}
		});
		console.log("result:" + result);
		res.json(result);

	} catch (error) {
		console.log(error);
		if (error instanceof ForbiddenError) {
			res.status(403).send("Forbidden");
		} else
			res.status(500).send("failed to add loans");
	}
});

loanedSamplesRouter.post("/loan-return", async (req, res) => {
	try {
		const loanerId = await Loans.findOne({
			attributes: ['lainaaja_id'],
            where: { id: req.body.id }
        })

		if (loanerId.lainaaja_id != req.user.id)
			ForbiddenError.from(req.ability).throwUnlessCan("manage"); //vaaditaan korkeampi oikeustaso, jos palauttaa toisten lainoja
		else
			ForbiddenError.from(req.ability).throwUnlessCan("loan");
        

		const result = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
		}, async (t) => {
			const updatedLoan = await Loans.update(
				{
					voimassa: 0,
					lopullinen_palautus_pvm: new Date(),
					palauttajan_id: req.user.id,
					avo_palautettu_tilavuus: req.body.avo_palautettu_tilavuus
				},
				{
					where: {
						id: req.body.id,
						voimassa: 1
					}
				}, { transaction: t });

			if (req.body.volumeChanged) {
				const updatedSource = await RadiationSources.update(
					{ avo_nykyinen_tilavuus: req.body.avo_palautettu_tilavuus },
					{
						where: {
							id: req.body.sateilylahteet_id
						}
					}, { transaction: t });
			}

			return updatedLoan;
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
 * New loan
 */
loanedSamplesRouter.post("/", async (req, res) => {
	try {
		ForbiddenError.from(req.ability).throwUnlessCan("loan");
	} catch (error) {
		if (error instanceof ForbiddenError) {
			console.log(error.message);
		}
		res.status(403).send("Forbidden");
	}

	console.log(req.body);
	try {
		await Loans.create({
			voimassa: req.body.voimassa,
			lainaus_pvm: req.body.lainaus_pvm,
			arvioitu_palautus_pvm: req.body.arvioitu_palautus_pvm,
			lopullinen_palautus_pvm: req.body.lopullinen_palautus_pvm,
			lainaus_syy: req.body.lainaus_syy,
			lainaaja_id: req.body.lainaaja_id,
			nayte_id: req.body.nayte_id,
			avo_palautettu_tilavuus: req.body.avo_palautettu_tilavuus,
			sailytys_tiedot: req.body.sailytys_tiedot,
			palauttajan_id: req.body.palauttajan_id
		})
		res.json({
			"msg": "OK, added new loan"
		})
	} catch (error) {
		console.error(error)
		res.status(500).send("failed to save loan")
	}
})


module.exports = loanedSamplesRouter;
