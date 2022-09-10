import express from 'express';
import validate from '../../middlewares/validate';
import * as creationValidation from '../../validations/creation.validation';
import * as creationController from '../../controllers/creation.controller';

const router = express.Router();

router.route('/').post(validate(creationValidation.createCreation), creationController.createCreation);

router
  .route('/:creation_id')
  .get(validate(creationValidation.getCreation), creationController.getCreationById)
  .patch(validate(creationValidation.updateCreation), creationController.updateCreationById)
  .delete(validate(creationValidation.deleteCreation), creationController.deleteCreationById);

export default router;
