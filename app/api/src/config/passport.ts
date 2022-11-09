import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions, VerifyCallback } from 'passport-jwt';
import * as userService from '../services/user.service';
import config from './config';

const jwtOptions: StrategyOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (token, done): Promise<void> => {
  try {
    const user = await userService.getUserByWalletAddress(token.sub);
    return done(null, user || false);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
