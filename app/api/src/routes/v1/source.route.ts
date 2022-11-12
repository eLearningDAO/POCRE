import express from 'express';
import validate from '../../middlewares/validate';
import * as sourceValidation from '../../validations/source.validation';
import * as sourceController from '../../controllers/source.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').post(auth(), validate(sourceValidation.createSource), sourceController.createSource);

router
  .route('/:source_id')
  .get(validate(sourceValidation.getSource), sourceController.getSourceById)
  .patch(auth(), validate(sourceValidation.updateSource), sourceController.updateSourceById)
  .delete(auth(), validate(sourceValidation.deleteSource), sourceController.deleteSourceById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Source
 *   description: Source management and retrieval
 */

/**
 * @swagger
 * /source:
 *   post:
 *     summary: Create a source
 *     description: Creates a new source.
 *     tags: [Source]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source_title
 *             properties:
 *               source_title:
 *                 type: string
 *               source_description:
 *                 type: string
 *                 description: can be null
 *               site_url:
 *                 type: string
 *                 description: can be null
 *             example:
 *                source_title: turtle
 *                source_description: turtle walks
 *                site_url: https://google.com
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Source'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /source/{source_id}:
 *   get:
 *     summary: Get a source by id
 *     description: Get details about a source by its id
 *     tags: [Source]
 *     parameters:
 *       - in: path
 *         name: source_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Source'
 *       "404":
 *         $ref: '#/components/responses/SourceNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a source by id
 *     description: Update source details by its id
 *     tags: [Source]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: source_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source_title:
 *                 type: string
 *               source_description:
 *                 type: string
 *                 description: can be null
 *               site_url:
 *                 type: string
 *                 description: can be null
 *             example:
 *                source_title: turtle
 *                source_description: turtle walks
 *                site_url: https://google.com
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Source'
 *       "404":
 *         $ref: '#/components/responses/SourceNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a source by id
 *     description: Deletes a source by its id
 *     tags: [Source]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: source_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/SourceNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
