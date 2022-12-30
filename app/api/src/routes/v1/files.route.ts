import express from 'express';
import * as filesController from '../../controllers/files.controller';
import validate from '../../middlewares/validate';
import * as filesValidation from '../../validations/files.validation';

const router = express.Router();

router.route('/media-type').get(validate(filesValidation.getMediaType), filesController.getMediaType);

export default router;

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Files management and retrieval
 */

/**
 * @swagger
 * /files/media-type:
 *   get:
 *     summary: Get media type of file
 *     description: Return the media type of file from its link. Supported media type are image, video, audio, document and pdf.
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: link
 *         description: The link to check for media type
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/FileMediaType'
 *       "406":
 *         $ref: '#/components/responses/InvalidMediaLink'
 */
