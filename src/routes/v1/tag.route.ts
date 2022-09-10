import express from 'express';
import validate from '../../middlewares/validate';
import * as tagValidation from '../../validations/tag.validation';
import * as tagController from '../../controllers/tag.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(tagValidation.createTag), tagController.createTag)
  .get(validate(tagValidation.queryTags), tagController.queryTags);

router
  .route('/:tag_id')
  .get(validate(tagValidation.getTag), tagController.getTagById)
  .patch(validate(tagValidation.updateTag), tagController.updateTagById)
  .delete(validate(tagValidation.deleteTag), tagController.deleteTagById);

export default router;
