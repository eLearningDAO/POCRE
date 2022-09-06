import express from 'express';
import validate from '../../middlewares/validate';
import * as userValidation from '../../validations/user.validation';
import * as userController from '../../controllers/user.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(userValidation.createUser), userController.createUser)
  .get(validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:user_id')
  .get(validate(userValidation.getUser), userController.getUserById)
  .patch(validate(userValidation.updateUser), userController.updateUserById)
  .delete(validate(userValidation.deleteUser), userController.deleteUserById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Creates a new user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *             properties:
 *               user_name:
 *                 type: string
 *               wallet_address:
 *                 type: string
 *                 description: can be null
 *               user_bio:
 *                 type: string
 *                 description: can be null
 *             example:
 *                user_name: john
 *                wallet_address: 28y9gd27g2g237g80hnibhi
 *                user_bio: ready to explore
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all users
 *     description: Returns a list of users.
 *     tags: [Users]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/User'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     summary: Get a user by id
 *     description: Get details about a user by their id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a user by id
 *     description: Update user details by their id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *             properties:
 *               user_name:
 *                 type: string
 *               wallet_address:
 *                 type: string
 *                 description: can be null
 *               user_bio:
 *                 type: string
 *                 description: can be null
 *             example:
 *                user_name: john
 *                wallet_address: 28y9gd27g2g237g80hnibhi
 *                user_bio: ready to explore
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a user by id
 *     description: Deletes a user by their id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
