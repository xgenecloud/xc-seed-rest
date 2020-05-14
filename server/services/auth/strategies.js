const passport = require('passport');
const refresh = require('passport-oauth2-refresh');
const PassportLocalStrategy = require('passport-local').Strategy;

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const FacebookStrategy = require('passport-facebook').Strategy;

const { XcUtils} = require('xc-core');

const bcrypt = require('bcryptjs');

passport.serializeUser(function ({id, email, email_verified, roles, provider}, done) {
  done(null, {
    id,
    email,
    email_verified,
    provider,
    roles: (roles || '')
      .split(',')
      .reduce((obj, role) => Object.assign(obj, {[role]: true}), {})
  });
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


class Strategy {

  constructor({app}) {
    this.local({app})
    this.google({app})
    this.facebook({app})
  }


  local({app}) {
    passport.use(new PassportLocalStrategy({usernameField: 'email'},

      async function (email, password, done) {

        try {

          let user = await app.$dbs.primary.users.findOne({where: `(email,eq,${email})`})

          if (!user || !user.email) {
            return done({msg: `Email ${email} is not registered!`});
          }

          const hashedPassword = await XcUtils.getBCryptHash(bcrypt, password, user.salt);

          if (user.password !== hashedPassword) {
            return done({msg: `Password not valid!`});
          } else {
            return done(null, user);
          }

        } catch (e) {
          done(e);
        }
      }
    ));
  }


  google({app}) {

    const googleStrategy = new GoogleStrategy({
        clientID:app.$config.auth.google.clientID,
        clientSecret:app.$config.auth.google.clientSecret,
        callbackURL:app.$config.auth.google.callbackUrl
      },
      async function (accessToken, refreshToken, profile, cb) {
        try {
          let user = await app.$dbs.primary.users.findOne({where: `(email,eq,${profile.emails[0].value})`})
          if (!user || !user.email) {
            user = await app.$dbs.primary.users.insert({
              email: profile.emails[0].value,
              provider: 'google',
              provider_data: JSON.stringify({accessToken, refreshToken, profile}),
              provider_ids: profile.id,
              password: '',
              salt: ''
            });
          } else if (user.provider !== 'google') {
            return cb({msg: 'Email is already registered with different ' + user.provider}, null)
          }
          cb(null, user);
        } catch (e) {
          cb(e, null)
        }
      }
    );
    passport.use(googleStrategy);
    refresh.use(googleStrategy);

  }

  facebook({app}) {

    const facebookStrategy = new FacebookStrategy({
        clientID:app.$config.auth.facebook.clientID,
        clientSecret:app.$config.auth.facebook.clientSecret,
        callbackURL:app.$config.auth.facebook.callbackUrl,
        profileFields: ['name', 'email'],
      },
      async function (accessToken, refreshToken, profile, cb) {
        console.log(accessToken, refreshToken, profile)
        try {
          let user = await app.$dbs.primary.users.findOne({where: `(email,eq,${profile.emails[0].value})`})
          if (!user || !user.email) {
            user = await app.$dbs.primary.users.insert({
              email: profile.emails[0].value,
              provider: 'facebook',
              provider_data: JSON.stringify({accessToken, refreshToken, profile}),
              provider_ids: profile.id,
              password: '',
              salt: ''
            });
          } else if (user.provider !== 'facebook') {
            return cb({msg: 'Email is already registered with different ' + user.provider}, null)
          }

          cb(null, user);
        } catch (e) {
          cb(e, null)
        }
      }
    );
    passport.use(facebookStrategy);
    refresh.use(facebookStrategy);

  }

}

module.exports = Strategy;