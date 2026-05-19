var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../model/user.model");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            verify_email: true,
          });
        }
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    },
  ),
);
