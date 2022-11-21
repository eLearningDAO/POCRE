import { createUser, getUserByWalletAddress } from '../services/user.service';
import catchAsync from '../utils/catchAsync';
import { encrypt } from '../utils/crypt';
import { encode } from '../utils/jwt';

export const createSession = catchAsync(async (req, res): Promise<void> => {
  // hash user wallet address
  const hashedWalletAddress = encrypt(req.body.wallet_address);

  // make jwt token for user
  const token = encode(hashedWalletAddress);

  let user: any;
  try {
    // get the user by hashed wallet address (remove sensitive data)
    user = await getUserByWalletAddress(hashedWalletAddress as string);
    delete user.wallet_address;
    delete user.verified_id;
  } catch {
    // if user not found then create one
    if (!user) {
      user = await createUser({
        user_name: 'anonymous',
        wallet_address: hashedWalletAddress,
      });
    }
  }

  res.send({ user, token });
});
