import express from 'express';
import validate from '../../middlewares/validate';
import * as statusValidation from '../../validations/status.validation';
import * as statusController from '../../controllers/status.controller';

const router = express.Router();

router.route('/').post(validate(statusValidation.createStatus), statusController.createStatus);

router
  .route('/:status_id')
  .get(validate(statusValidation.getStatus), statusController.getStatusById)
  .patch(validate(statusValidation.updateStatus), statusController.updateStatusById)
  .delete(validate(statusValidation.deleteStatus), statusController.deleteStatusById);

export default router;
