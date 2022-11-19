import express from 'express';
import validate from '../../middlewares/validate';
import * as authValidation from '../../validations/auth.validation';
import * as authController from '../../controllers/auth.controller';

const router = express.Router();

router.route('/login').post(validate(authValidation.createSession), authController.createSession);

export default router;

