import * as transactionService from '../services/transaction.service';
import { IUserDoc } from '../services/user.service';
import catchAsync from '../utils/catchAsync';

export const createTransaction = catchAsync(async (req, res): Promise<void> => {
  const newTransaction = await transactionService.createTransaction({
    ...req.body,
    maker_id: (req.user as IUserDoc).user_id,
  });
  res.send(newTransaction);
});
