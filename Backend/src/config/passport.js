const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const SuperAdmin = require("../models/SuperadminModel");

// const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
   async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  console.log("Google Email:", email);

const user = await SuperAdmin.findOne({ email });

console.log("User Found:", user);

const superAdmin = await SuperAdmin.findOne({
  email,
  role: "superadmin",
});

console.log("Google Email:", email);
console.log("Super Admin:", superAdmin);

if (!superAdmin) {
  return done(null, false, {
    message: "This Google account is not authorized.",
  });
}

superAdmin.googleId = profile.id;
superAdmin.avatar = profile.photos[0].value;

await superAdmin.save();

return done(null, superAdmin);
   }
  )
);

module.exports = passport;