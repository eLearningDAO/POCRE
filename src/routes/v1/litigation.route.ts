import express from 'express';
import validate from '../../middlewares/validate';
import * as litigationValidation from '../../validations/litigation.validation';
import * as litigationController from '../../controllers/litigation.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(litigationValidation.createLitigation), litigationController.createLitigation)
  .get(validate(litigationValidation.queryLitigations), litigationController.queryLitigations);

router
  .route('/:litigation_id')
  .get(validate(litigationValidation.getLitigation), litigationController.getLitigationById)
  .patch(validate(litigationValidation.updateLitigation), litigationController.updateLitigationById)
  .delete(validate(litigationValidation.deleteLitigation), litigationController.deleteLitigationById);

export default router;
