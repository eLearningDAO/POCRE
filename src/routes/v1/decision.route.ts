import express from 'express';
import validate from '../../middlewares/validate';
import * as decisionValidation from '../../validations/decision.validation';
import * as decisionController from '../../controllers/decision.controller';

const router = express.Router();

router.route('/').post(validate(decisionValidation.createDecision), decisionController.createDecision);

router
  .route('/:decision_id')
  .get(validate(decisionValidation.getDecision), decisionController.getDecisionById)
  .patch(validate(decisionValidation.updateDecision), decisionController.updateDecisionById)
  .delete(validate(decisionValidation.deleteDecision), decisionController.deleteDecisionById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Decision
 *   description: Decision management and retrieval
 */

/**
 * @swagger
 * /decision:
 *   post:
 *     summary: Create a decision
 *     description: Creates a new decision.
 *     tags: [Decision]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision_status
 *               - maker_id
 *             properties:
 *               decision_status:
 *                 type: bool
 *               maker_id:
 *                 type: string
 *                 format: uuid
 *                 description: must be a valid user id
 *             example:
 *                decision_status: true
 *                maker_id: c83a8680-e5db-4a79-8646-c6e3d010ec6b
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Decision'
 *       "404":
 *         $ref: '#/components/responses/UserNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /decision/{decision_id}:
 *   get:
 *     summary: Get a decision by id
 *     description: Get details about a decision by its id
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: decision_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Decision id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Decision'
 *       "404":
 *         $ref: '#/components/responses/DecisionNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a decision by id
 *     description: Update source details by its id
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: decision_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Decision id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision_status:
 *                 type: bool
 *               maker_id:
 *                 type: string
 *                 format: uuid
 *                 description: must be a valid user id
 *             example:
 *                decision_status: true
 *                maker_id: c83a8680-e5db-4a79-8646-c6e3d010ec6b
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Decision'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/DecisionNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *             examples:
 *               decisionnotfound:
 *                 summary: DecisionNotFound
 *                 value:
 *                   code: 404
 *                   message: decision not found
 *               usernotfound:
 *                 summary: UserNotFound
 *                 value:
 *                   code: 404
 *                   message: user not found
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a decision by id
 *     description: Deletes a decision by its id
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: decision_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Decision id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/DecisionNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
