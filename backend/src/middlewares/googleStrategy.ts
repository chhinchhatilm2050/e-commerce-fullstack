import { Strategy as GoogleOAuthStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import UserModel from '../model/user.js';
console.log('DEBUG callbackURL:', process.env.GOOGLE_CALLBACK_URL);
export const GoogleStrategy = new GoogleOAuthStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email'],
  },
  async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> => {
    try {
      let user = await UserModel.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      const email = profile.emails?.[0]?.value;
      if(email) {
        user = await UserModel.findOne({ email });
        if(user) {
          if(!user.facebookId) {       
            user.facebookId = profile.id;
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }
      }

      user = await UserModel.create({
        googleId: profile.id,
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || profile.username,
        lastName: profile.name?.familyName,
        email, 
      });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);