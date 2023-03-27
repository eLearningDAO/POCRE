import express from 'express';
import validate from '../../middlewares/validate';
import * as recognitionValidation from '../../validations/recognition.validation';
import * as recognitionController from '../../controllers/recognition.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(recognitionValidation.createRecognition), recognitionController.createRecognition)
  .get(validate(recognitionValidation.queryRecognitions), recognitionController.queryRecognitions);

router
  .route('/:recognition_id')
  .get(validate(recognitionValidation.getRecognition), recognitionController.getRecognitionById)
  .patch(auth(), validate(recognitionValidation.updateRecognition), recognitionController.updateRecognitionById)
  .delete(auth(), validate(recognitionValidation.deleteRecognition), recognitionController.deleteRecognitionById);

router
  .route('/:recognition_id/respond')
  .post(auth(), validate(recognitionValidation.respondToRecognition), recognitionController.respondToRecognition);

export default router;

/**
 * @swagger
 * tags:
 *   name: Recognition
 *   description: Recognition management and retrieval
 */

/**
 * @swagger
 * /recognitions:
 *   post:
 *     summary: Create a recognition
 *     description: Creates a new recognition.
 *     tags: [Recognition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recognition_for
 *               - status
 *             properties:
 *               recognition_for:
 *                 type: uuid
 *               recognition_description:
 *                 type: string
 *                 description: can be null
 *               status:
 *                 type: string
 *                 enum: [pending,accepted,declined]
 *               status_updated:
 *                 type: string
 *                 format: date-time
 *             example:
 *                recognition_for: d5cef9e4-d497-45ea-bd68-609aba268887
 *                recognition_description: null
 *                status: pending
 *                status_updated: 2022-09-05T19:00:00.000Z
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Recognition'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/UserNotFound'
 *             examples:
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all recognitions
 *     description: Returns a list of recognitions.
 *     tags: [Recognition]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of recognitions
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: String to search
 *       - in: query
 *         name: search_fields
 *         schema:
 *           type: string[]
 *         description: list of fields to query search
 *       - in: query
 *         name: ascend_fields
 *         schema:
 *           type: string[]
 *         description: list of fields to order by ascending
 *       - in: query
 *         name: descend_fields
 *         schema:
 *           type: string[]
 *         description: list of fields to order by descending
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - recognition_by
 *               - recognition_for
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recognition'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total_pages:
 *                   type: integer
 *                   example: 1
 *                 total_results:
 *                   type: integer
 *                   example: 1
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /recognitions/{recognition_id}:
 *   get:
 *     summary: Get a recognition by id
 *     description: Get details about a recognition by its id
 *     tags: [Recognition]
 *     parameters:
 *       - in: path
 *         name: recognition_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recognition id
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - recognition_by
 *               - recognition_for
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Recognition'
 *       "404":
 *         $ref: '#/components/responses/RecognitionNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a recognition by id
 *     description: Update recognition details by its id
 *     tags: [Recognition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recognition_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recognition id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recognition_for:
 *                 type: uuid
 *               recognition_description:
 *                 type: string
 *                 description: can be null
 *               status:
 *                 type: string
 *                 enum: [pending,accepted,declined]
 *               status_updated:
 *                 type: string
 *                 format: date-time
 *             example:
 *                recognition_for: d5cef9e4-d497-45ea-bd68-609aba268887
 *                recognition_description: null
 *                status: pending
 *                status_updated: 2022-09-05T19:00:00.000Z
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Recognition'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/RecognitionNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *             examples:
 *               RecognitionNotFound:
 *                 summary: recognition not found
 *                 value:
 *                   code: 404
 *                   message: recognition not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a recognition by id
 *     description: Deletes a recognition by its id
 *     tags: [Recognition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recognition_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recognition id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/RecognitionNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /recognitions/{recognition_id}/respond:
 *   post:
 *     summary: Respond to a recognition by id
 *     description: Respond to a recognition by its id
 *     tags: [Recognition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recognition_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recognition id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending,accepted,declined]
 *               status_updated:
 *                 type: string
 *                 format: date-time
 *               transaction_id:
 *                 type: string
 *                 description: required when status is accepted
 *             example:
 *                status: pending
 *                status_updated: 2022-09-05T19:00:00.000Z
 *                transaction_id: d5cef9e4-d497-45ea-bd68-609aba268887
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Recognition'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/RecognitionNotFound'
 *                 - $ref: '#/components/responses/TransactionNotFound'
 *                 - $ref: '#/components/responses/TransactionAlreadyExists'
 *                 - $ref: '#/components/responses/TransactionPurposeInvalidForRecognition'
 *                 - $ref: '#/components/responses/TransactionAlreadyExistsForRecognition'
 *             examples:
 *               RecognitionNotFound:
 *                 summary: recognition not found
 *                 value:
 *                   code: 404
 *                   message: recognition not found
 *               TransactionNotFound:
 *                 summary: transaction not found
 *                 value:
 *                   code: 404
 *                   message: transaction not found
 *               TransactionAlreadyExists:
 *                 summary: transaction already exists
 *                 value:
 *                   code: 404
 *                   message: transaction already exists
 *               TransactionPurposeInvalidForRecognition:
 *                 summary: invalid transaction purpose for recognition
 *                 value:
 *                   code: 404
 *                   message: invalid transaction purpose for recognition
 *               TransactionAlreadyExistsForRecognition:
 *                 summary: transaction already exists for recognition
 *                 value:
 *                   code: 404
 *                   message: transaction already exists for recognition
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
