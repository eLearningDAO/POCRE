import express from 'express';
import validate from '../../middlewares/validate';
import * as materialTypeValidation from '../../validations/materialType.validation';
import * as materialTypeController from '../../controllers/materialType.controller';

const router = express.Router();

router.route('/').post(validate(materialTypeValidation.createMaterialType), materialTypeController.createMaterialType);

router
  .route('/:type_id')
  .get(validate(materialTypeValidation.getMaterialType), materialTypeController.getMaterialTypeById)
  .patch(validate(materialTypeValidation.updateMaterialType), materialTypeController.updateMaterialTypeById)
  .delete(validate(materialTypeValidation.deleteMaterialType), materialTypeController.deleteMaterialTypeById);

export default router;
