import express from 'express';
import * as tokenController from '../../controllers/token.controller';
import validate from '../../middlewares/validate';
import * as tokenValidation from '../../validations/token.validation';

const router = express.Router();

router.route('/').post(validate(tokenValidation.createToken), tokenController.createToken);

export default router;

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Token management and retrieval
 */

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Create a token
 *     description: Creates a new jwt token.
 *     tags: [Token]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payload
 *             properties:
 *               payload:
 *                 type: string
 *                 description: the string to encode as jwt
 *             example:
 *                payload: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Token'
 */
