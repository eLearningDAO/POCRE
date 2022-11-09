import express from 'express';
import * as tokenController from '../../controllers/token.controller';
import validate from '../../middlewares/validate';
import * as tokenValidation from '../../validations/token.validation';

const router = express.Router();

router.route('/').post(validate(tokenValidation.createToken), tokenController.createToken);

export default router;
