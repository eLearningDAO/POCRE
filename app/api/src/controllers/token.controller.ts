import { encode } from '../utils/jwt';
import catchAsync from '../utils/catchAsync';

export const createToken = catchAsync(async (req, res): Promise<void> => {
  const newToken = encode(req.body.payload);
  res.send({ token: newToken });
});
