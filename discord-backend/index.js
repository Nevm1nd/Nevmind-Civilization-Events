const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config();

const app = express();

// Session middleware (needed for Passport to work)
app.use(
  session({
    secret: "supersecret", // change to a stronger secret in production
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Discord strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL, // e.g. https://yourapp.onrender.com/auth/discord/callback
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello! Go to <a href='/auth/discord'>Login with Discord</a>");
});

app.get(
  "/auth/discord",
  passport.authenticate("discord")
);

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/auth/discord/failure",
  }),
  (req, res) => {
    // Successful login
    res.send(`Logged in as ${req.user.username}#${req.user.discriminator}`);
  }
);

app.get("/auth/discord/failure", (req, res) => {
  res.send("Failed to authenticate with Discord.");
});

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
