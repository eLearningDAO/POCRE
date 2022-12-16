import express from 'express';
import validate from '../../middlewares/validate';
import * as authValidation from '../../validations/auth.validation';
import * as authController from '../../controllers/auth.controller';

const router = express.Router();

router.route('/login').post(validate(authValidation.login), authController.login);
router.route('/signup').post(validate(authValidation.signup), authController.signup);

export default router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth and session management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Creates a new auth session for a user
 *     description: Creates a new jwt for a user using wallet address. If user is not present it will create a new one and return that as response
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet_address
 *             properties:
 *               wallet_address:
 *                 type: string
 *             example:
 *                wallet_address: 89y98gf37g87cg26dr63rf7dt8734t2df683xvc
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Session'
 */
