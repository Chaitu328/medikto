const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const SuperAdmin = require("../models/SuperadminModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      if (email !== process.env.SUPERADMIN_EMAIL) {
        return done(null, false);
      }

      let admin = await SuperAdmin.findOne({ email });

      if (!admin) {
        admin = await SuperAdmin.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos[0].value,
        });
      }

      return done(null, admin);
    }
  )
);

module.exports = passport;