import express from 'express';
import * as transactionController from '../../controllers/transaction.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as transactionValidation from '../../validations/transaction.validation';

const router = express.Router();

router.route('/').post(auth(), validate(transactionValidation.createTransaction), transactionController.createTransaction);

export default router;

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management and retrieval
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a transaction
 *     description: Creates a new transaction.
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_hash
 *               - transaction_purpose
 *             properties:
 *               transaction_hash:
 *                 type: string
 *               transaction_purpose:
 *                 type: string
 *                 enum: [publish_creation, finalize_creation, start_litigation, cast_litigation_vote, redeem_litigated_item, accept_recognition]
 *             example:
 *                transaction_hash: aa62ba02b24185e0d9eb2074518c0be09d3b76644de5511eeaa09fc117c1f38f
 *                transaction_purpose: publish_creation
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Transaction'
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
 *       "409":
 *         $ref: '#/components/responses/TagAlreadyExists'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
