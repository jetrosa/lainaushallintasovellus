const express = require('express');
const session = require("express-session");
const MemoryStore = require('memorystore')(session)
const passport = require("passport");
const passportCustom = require("passport-custom");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { sequelize } = require("./models/index");
const Users = sequelize.models.kayttajat;

dotenv.config()

//jos true, luodaan uusi käyttäjä automaattisesti, jos tunnus ei vielä käytössä
const selfReqistration = true;
//käytössä olevan kirjautumistunnisteen nimi tietokannassa HUOM muutokset tehtävä myös models/kayttajat.js, db/in.sql ja config/schema.sql
const dbUserIdColumnName = "kieku_id";

passport.use(new passportCustom.Strategy(
  function (req, done) {
    const id = req.header('X-REMOTE-USER');
    console.log('apache remote user: ' + id);

    const user = new Object();
    user[dbUserIdColumnName] = id;
    done(null, user);
  }
));

const app = express();
const PORT = (process.env.PORT || 3002);

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(session({
  cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET   
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())

// CASL authz - autorisaatiosääntöjen (roolien mukaan) konfigurointi
require(`./authz`).configure(app);

passport.serializeUser(function (user, done) {
  console.log("serialize user: " + JSON.stringify(user))
  done(null, user[dbUserIdColumnName]);
});

passport.deserializeUser(function (req, id, done) {
  console.log("deserializing userid: " + id);
  Users.findOne({
    where: { [dbUserIdColumnName]: id }
  }).then(function (user) {
    if (user) {
      console.log("deserialized user: " + user[dbUserIdColumnName] + " auth level: " + user.oikeustaso);
      done(null, user);
    } else {
      console.log("user not found");
      if (selfReqistration) {
        //create a new user to the database
        console.log("creating a new user");
        Users.create({ [dbUserIdColumnName]: id, etunimi: "default", sukunimi: "default", oikeustaso: 5, aktiivinen: 1, sahkoposti: "default", osasto_id: 1 })
          .then(
            function (user) {
              done(null, user);
            })
      } else {
        done("error", null);
        req.session.destroy();
      }
    }
  });
});

function ensureAuthenticated(req, res, next) {
  //return next();
  if (req.isAuthenticated())
    return next();
  else
    res.redirect('/')
}

// Yhteys tietokantaan:
sequelize.sync().then(() => {
  console.log("Yhteys tietokantaan muodostettu.")
  app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
  });
}).catch((err) => {
  console.log("Virhe yhdistäessä.")
})

/**
 * login apacheserverillä (ad)
 */
app.get('/api/login',
  passport.authenticate('custom'),
  (req, res) => {
    console.log('login ok')
    res.redirect('/')
  }
);

app.get('/api/userid',
  (req, res) => {
    if (req.isAuthenticated)
      res.status(200).send(req.user[dbUserIdColumnName]);
    else
      res.status(401).send('Unauthorized')
  }
);

// Get the user information of the logged-in user
app.get('/api/activeuser',
  (req, res) => {
    if (req.isAuthenticated) {
      res.status(200).json({
        id: req.user.id,
        remote_user: req.user[dbUserIdColumnName],
        firstname: req.user.etunimi,
        lastname: req.user.sukunimi,
        auth_level: req.user.oikeustaso,
        email: req.user.sahkoposti,
        department_id: req.user.osasto_id
      });
    } else
      res.status(401).send('Unauthorized')
  }
);

app.get('/api/authenticated',
  (req, res) => {
    res.status(200).send(req.isAuthenticated());
  }
);

app.get('/api/logout', function (req, res) {
  console.log("Backend got logout!")
  req.logout();
  res.redirect('/');
});

/**
 * Oikeustasojen haku
 */
app.get('/api/authorizationlevels', ensureAuthenticated, async (req, res) => {
  try {
    res.json(await sequelize.models.oikeustasot.findAll({}))
    console.log("Got authorization levels from db.")
  } catch (error) {
    console.error(error)
    res.status(500).send("failed to get authorization levels")
  }
})

/**
 * Yksittäinen oikeustaso
 */
app.get("/api/authorizationlevels/:permission_id", async (req, res) => {
  try {
    res.json(await sequelize.models.oikeustasot.findOne({
      where: { id: req.params.permission_id }
    }))
    console.log("Got the requested authorization level from db.")
  } catch (error) {
    console.error(error)
    res.status(500).send("failed to get the requested authorization level")
  }
})

// Routes
const sourcesRouter = require("./src/routes/sources.router");
const sourceNuclidesRouter = require("./src/routes/sourceNuclides.router");
const loanedSamplesRouter = require("./src/routes/loanedSamples.router");
const usersRouter = require("./src/routes/users.router");
const departmentsRouter = require("./src/routes/departments.router");
const sourceEditsRouter = require("./src/routes/sourceEdits.router");
const nuclideRouter = require("./src/routes/nuclides.router");

// router endpoints
app.use("/api/samples", ensureAuthenticated, sourcesRouter);
app.use("/api/sourcenuclides", ensureAuthenticated, sourceNuclidesRouter);
app.use("/api/loanedsamples", ensureAuthenticated, loanedSamplesRouter);
app.use("/api/users", ensureAuthenticated, usersRouter);
app.use("/api/departments", ensureAuthenticated, departmentsRouter);
app.use("/api/sourceedits", ensureAuthenticated, sourceEditsRouter);
app.use("/api/nuclides", ensureAuthenticated, nuclideRouter);
