/**
 * Käytöstä poistettu SAML-login (passport-saml), testipalvelu oli toiminnassa, ei tuotantokäytössä (oli testikäytössä vielä 10/2021)
 * Koodi oli backendin server.js -tiedostossa.
 * sso-kansion sisältö (cert.pem, idp.pem ja key.pem) olivat käytössä testipalvelun kanssa
 * 
 * lisäksi .env tiedostossa ympäristömuuttujina:
 * CALLBACK_URL=http://localhost:3002/api/login/callback/
 * ENTRY_POINT=https://samltest.id/idp/profile/SAML2/Redirect/SSO
 * ISSUER=testausSP2021
 * LOGIN_REDIRECT_URL=http://localhost:80/
 */


// const saml = require("passport-saml");

// const samlStrategy = new saml.Strategy({
//   callbackUrl: process.env.CALLBACK_URL,
//   entryPoint: process.env.ENTRY_POINT,
//   issuer: process.env.ISSUER,
//   forceAuthn: true,
//   decryptionPvk: fs.readFileSync(__dirname + '/sso/key.pem', 'utf8'),
//   privateKey: fs.readFileSync(__dirname + '/sso/key.pem', 'utf8'),
//   cert: fs.readFileSync(__dirname + '/sso/idp.pem', 'utf8'),
// }, (profile, done) => {
//   //console.log(profile)
//   return done(null, profile);
// });

// passport.use(samlStrategy);

// /**
//  * SAML/SSO
//  */
// app.get('/api/saml_login',
//   passport.authenticate('saml', { failureRedirect: '/api/login/fail' }),
//   (req, res) => {
//     res.status(401).send('Login failed');
//   }
// );

// app.post('/api/login/callback',
//   bodyParser.urlencoded({ extended: false }),
//   passport.authenticate('saml', { failureRedirect: '/login/fail' }),
//   (req, res) => {
//     console.log("Got SSO callback")
//     res.redirect(process.env.LOGIN_REDIRECT_URL)
//   }
// );

// app.get('/api/login/fail',
//   (req, res) => {
//     res.status(401).send('Login failed');
//   }
// );

// app.get('/api/metadata',
//   (req, res) => {
//     res.type('application/xml');
//     res.status(200).send(samlStrategy.generateServiceProviderMetadata(fs.readFileSync(__dirname + '/sso/key.pem', 'utf8'), fs.readFileSync(__dirname + '/sso/cert.pem', 'utf8')));
//   }
// );