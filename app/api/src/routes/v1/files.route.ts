import express from 'express';
import * as filesController from '../../controllers/files.controller';
import validate from '../../middlewares/validate';
import * as filesValidation from '../../validations/files.validation';

const router = express.Router();

router.route('/media-type').get(validate(filesValidation.getMediaType), filesController.getMediaType);

export default router;
