import express from 'express';
import validate from '../../middlewares/validate';
import * as materialValidation from '../../validations/material.validation';
import * as materialController from '../../controllers/material.controller';

const router = express.Router();

router.route('/').post(validate(materialValidation.createMaterial), materialController.createMaterial);

router
  .route('/:material_id')
  .get(validate(materialValidation.getMaterial), materialController.getMaterialById)
  .patch(validate(materialValidation.updateMaterial), materialController.updateMaterialById)
  .delete(validate(materialValidation.deleteMaterial), materialController.deleteMaterialById);

export default router;
