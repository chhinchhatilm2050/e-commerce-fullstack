import { Strategy as GitHubOAuthStrategy, Profile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import UserModel from '../model/user.js';

export const GitHubStrategy = new GitHubOAuthStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL!,
  scope: ['user:email']
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
        if(!user.githubId) {         
          user.githubId = profile.id;
          await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      }
    }

    user = await UserModel.create({
      githubId: profile.id,
      firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || profile.username,
      lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || 'N/A',
      email,
    });

    done(null, user);
  } catch(err) {
    return done(err);
  }
});