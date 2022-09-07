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

/**
 * @swagger
 * tags:
 *   name: Status
 *   description: Status management and retrieval
 */

/**
 * @swagger
 * /status:
 *   post:
 *     summary: Create a status
 *     description: Creates a new status.
 *     tags: [Status]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_name
 *             properties:
 *               status_name:
 *                 type: string
 *               status_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                status_name: invitation_created
 *                status_description: invitaion to john
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Status'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /status/{status_id}:
 *   get:
 *     summary: Get a status by id
 *     description: Get details about a status by its id
 *     tags: [Status]
 *     parameters:
 *       - in: path
 *         name: status_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Status id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Status'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a status by id
 *     description: Update status details by its id
 *     tags: [Status]
 *     parameters:
 *       - in: path
 *         name: status_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Status id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_name
 *             properties:
 *               status_name:
 *                 type: string
 *               status_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                status_name: invitation_created
 *                status_description: invitaion to john
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Status'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a status by id
 *     description: Deletes a status by its id
 *     tags: [Status]
 *     parameters:
 *       - in: path
 *         name: status_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Status id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
