import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { Strategy as GitHubOAuthStrategy, Profile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import UserModel from '../model/user.js';

export const GitHubStrategy = new GitHubOAuthStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL!,
  scope: ['profile', 'email'],
}, async(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> => {
  try {
    let user = await UserModel.findOne({githubId: profile.id});
    if(user) {
      return done(null, user);
    }

    const email = profile.emails?.[0]?.value;
    if(email) {;
      user = await UserModel.findOne({email});
      if(user) {
        user.githubId = profile.id;
        await user.save({validateBeforeSave: false});
        return done(null, user);
      }
    }

    user = await UserModel.create({
      githubId: profile.id,
      firstName: profile.name?.givenName || profile.displayName,
      lastName: profile.name?.familyName || '',
      email
    });

  } catch(err) {
    return done(err);
  }
});