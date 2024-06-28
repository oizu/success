import * as RateLimit from 'express-rate-limit';

const limit = Number(process.env.RATE_LIMIT_TIME) || 10;
const requests = Number(process.env.RATE_LIMIT_REQUEST) || 10;

if (!process.env.RATE_LIMIT_TIME)
  console.warn('Rate limit is not set. Default is 10 request per 10 minutes');

export default () => {
  return new RateLimit({
    windowMs: limit * 60 * 1000, // rateLimitTime minutes
    max: requests, // limit each IP to 3000 requests per windowMs
    delayMs: 0,
    message: 'Rate limit exceeded, please try again later some time.',
  });
};
