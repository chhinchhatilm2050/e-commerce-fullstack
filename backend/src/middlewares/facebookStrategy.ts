import dotenv from 'dotenv';
dotenv.config({path: '.dev.env'});
import { Strategy as FacebookOAuthStrategy } from 'passport-facebook';
import UserModel from '../model/user.js';
import { Profile } from 'passport';
import { VerifyCallback, VerifyErrors } from 'jsonwebtoken';

export const FacebookStrategy = new FacebookOAuthStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
  profileFields: ['id', 'displayName', 'name', 'emails'], 
}, async(accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
  try {

    let user = await UserModel.findOne({ facebookId: profile.id });
    if (user) return cb(null, user);

    const email = profile.emails?.[0]?.value;
    if(email) {
      user = await UserModel.findOne({ email });
      if(user) {
        if(!user.facebookId) {
          user.facebookId = profile.id;
          await user.save({ validateBeforeSave: false });
        }
        return cb(null, user);
      }
    }

    user = await UserModel.create({
      facebookId: profile.id,
      firstName: profile.name?.givenName || profile.displayName?.split(' ')[0],
      lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || 'N/A',
      email 
    });

    console.log('Created Facebook user:', user);
    return cb(null, user);
  } catch(err) {
    return cb(err as VerifyErrors);
  }
});