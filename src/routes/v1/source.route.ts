import express from 'express';
import validate from '../../middlewares/validate';
import * as sourceValidation from '../../validations/source.validation';
import * as sourceController from '../../controllers/source.controller';

const router = express.Router();

router.route('/').post(validate(sourceValidation.createSource), sourceController.createSource);

router
  .route('/:source_id')
  .get(validate(sourceValidation.getSource), sourceController.getSourceById)
  .patch(validate(sourceValidation.updateSource), sourceController.updateSourceById)
  .delete(validate(sourceValidation.deleteSource), sourceController.deleteSourceById);

export default router;
