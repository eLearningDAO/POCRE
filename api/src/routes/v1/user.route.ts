import express from 'express';
import validate from '../../middlewares/validate';
import * as userValidation from '../../validations/user.validation';
import * as userController from '../../controllers/user.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(userValidation.createUser), userController.createUser)
  .get(validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUserByID)
  .patch(validate(userValidation.updateUser), userController.updateUserByID)
  .delete(validate(userValidation.deleteUser), userController.deleteUserByID);

export default router;
