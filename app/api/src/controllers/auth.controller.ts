import httpStatus from 'http-status';
import { updateMaterialsInBulk } from '../services/material.service';
import { updateRecognitionsInBulk } from '../services/recognition.service';
import * as userService from '../services/user.service';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { encrypt } from '../utils/crypt';
import { encode, decode } from '../utils/jwt';

export const login = catchAsync(async (req, res): Promise<void> => {
  // hash user wallet address
  const hashedWalletAddress = encrypt(req.body.wallet_address);

  // make jwt token for user
  const token = encode(hashedWalletAddress);

  let user: any;
  try {
    // get the user by hashed wallet address (remove sensitive data)
    user = await userService.getUserByWalletAddress(hashedWalletAddress as string);
    delete user.wallet_address;
    delete user.verified_id;
  } catch {
    // if user not found then create one
    if (!user) {
      user = await userService.createUser({
        user_name: 'anonymous',
        wallet_address: hashedWalletAddress,
      });
    }
  }

  res.send({ user, token });
});

export const signup = catchAsync(async (req, res): Promise<any> => {
  // check if the token is valid
  const userId = decode(req.body.invite_token);
  const foundInvitedUser = await userService.getUserById(userId).catch(() => null);
  if (!foundInvitedUser || !foundInvitedUser.is_invited) {
    throw new ApiError(httpStatus.CONFLICT, `invalid invite token`);
  }

  // hash user wallet address
  const hashedWalletAddress = encrypt(req.body.wallet_address);

  // make jwt token for user
  const token = encode(hashedWalletAddress);

  let user: any = {};

  // check if user exists by wallet address
  const foundExistingUser = await userService.getUserByWalletAddress(hashedWalletAddress as string).catch(() => null);
  if (foundExistingUser) {
    // update all materials with existing user id
    await updateMaterialsInBulk('author_id', foundInvitedUser.user_id, foundExistingUser.user_id);

    // update all recognitions with existing user id
    await updateRecognitionsInBulk('recognition_for', foundInvitedUser.user_id, foundExistingUser.user_id);

    // merge invited and existing accounts
    user = { ...foundExistingUser };

    // delete the invited account
    await userService.deleteUserById(foundInvitedUser.user_id);
  } else {
    // make the user as non-invited and login
    user = await userService.updateUserById(userId, {
      user_name: foundInvitedUser.user_name || 'anonymous',
      is_invited: false,
      wallet_address: hashedWalletAddress,
    });
  }

  delete user.wallet_address;
  delete user.verified_id;
  return res.send({ user, token });
});
