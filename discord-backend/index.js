import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// session middleware
app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// passport config
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// discord strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL, // e.g. https://discord-login-backend-ndqi.onrender.com/auth/discord/callback
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// route: start login
app.get("/auth/discord/login", passport.authenticate("discord"));
res.send(`1111111`);

// route: callback
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    // successful login
    res.send(`Logged in as ${req.user.username}#${req.user.discriminator}`);
  }
);

// route: logout
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// home route
app.get("/", (req, res) => {
  res.send("Hello! Go to <a href='/auth/discord/login'>Login with Discord</a>");
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
