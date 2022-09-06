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
  .route('/:user_id')
  .get(validate(userValidation.getUser), userController.getUserById)
  .patch(validate(userValidation.updateUser), userController.updateUserById)
  .delete(validate(userValidation.deleteUser), userController.deleteUserById);

export default router;
