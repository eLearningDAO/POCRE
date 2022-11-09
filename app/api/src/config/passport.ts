import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions, VerifyCallback } from 'passport-jwt';
import config from './config';

const jwtOptions: StrategyOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (token, done): Promise<void> => {
  try {
    const user = {};
    return done(null, user || false);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
