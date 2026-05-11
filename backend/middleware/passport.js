// middleware/passport.js
// Configures the GitHub OAuth strategy for Passport.js
// Passport is the standard Node.js auth library.

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'], // request email permission from GitHub
    },
    // This function runs after GitHub confirms the user's identity
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if this GitHub user already has an account
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id.toString() },
        });

        if (!user) {
          // First login — create a new user record
          user = await prisma.user.create({
            data: {
              githubId: profile.id.toString(),
              name: profile.displayName || profile.username,
              email: profile.emails?.[0]?.value || null,
              avatar: profile.photos?.[0]?.value || null,
            },
          });
          console.log(`New user created: ${user.name}`);
        }

        // Pass user to the auth route handler
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
