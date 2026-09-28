const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const SuperAdmin = require("../models/SuperadminModel");

// Register Google OAuth strategy only when credentials are provided in environment
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK ||
          "https://api-prd.medikto.com/api/superadmin/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          console.log("Google Email:", email);

          const superAdmin = await SuperAdmin.findOne({
            email,
            role: "superadmin",
          });

          if (!superAdmin) {
            return done(null, false, {
              message: "This Google account is not authorized as superadmin.",
            });
          }

          superAdmin.googleId = profile.id;
          if (profile.photos && profile.photos.length > 0) {
            superAdmin.avatar = profile.photos[0].value;
          }

          await superAdmin.save();
          return done(null, superAdmin);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
  console.log("Google OAuth Strategy registered successfully for SuperAdmin.");
} else {
  console.warn(
    "⚠️ Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured. Superadmin Google login route will be inactive."
  );
}

module.exports = passport;