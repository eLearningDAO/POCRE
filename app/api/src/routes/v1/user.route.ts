import express from 'express';
import validate from '../../middlewares/validate';
import * as userValidation from '../../validations/user.validation';
import * as userController from '../../controllers/user.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(userValidation.createUser), userController.createUser)
  .get(validate(userValidation.queryUsers), userController.queryUsers);

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
 *               phone:
 *                 type: string
 *                 description: can be null
 *               email_address:
 *                 type: string
 *                 description: can be null
 *               verified_id:
 *                 type: string
 *                 description: can be null
 *               reputation_stars:
 *                 type: integer
 *               image_url:
 *                 type: string
 *                 description: can be null
 *             example:
 *                user_name: john
 *                wallet_address: 28y9gd27g2g237g80hnibhi
 *                user_bio: ready to explore
 *                phone: '+92313555544'
 *                email_address: 'example@example.com'
 *                verified_id: 28y9gd27g2g237g80hnibhi 
 *                reputation_stars: 0
 *                image_url: https://cryptologos.cc/logos/cardano-ada-logo.png
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
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
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
 *         name: top_authors
 *         schema:
 *           type: bool
 *         description: when true, returns users with most number of creations ordered by descending, a new field 'total_creations' is returned with each user response
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
 *                     $ref: '#/components/schemas/User'
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
 *         $ref: '#/components/responses/UserNotFound'
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
 *             properties:
 *               user_name:
 *                 type: string
 *               wallet_address:
 *                 type: string
 *                 description: can be null
 *               user_bio:
 *                 type: string
 *                 description: can be null
 *               phone:
 *                 type: string
 *                 description: can be null
 *               email_address:
 *                 type: string
 *                 description: can be null
 *               verified_id:
 *                 type: string
 *                 description: can be null
 *               reputation_stars:
 *                 type: integer  
 *               image_url:
 *                 type: string
 *                 description: can be null  
 *             example:
 *                user_name: john
 *                wallet_address: 28y9gd27g2g237g80hnibhi
 *                user_bio: ready to explore
  *                phone: '+92313555544'
 *                email_address: 'example@example.com'
 *                verified_id: 28y9gd27g2g237g80hnibhi  
 *                reputation_stars: 0
 *                image_url: https://cryptologos.cc/logos/cardano-ada-logo.png
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "404":
 *         $ref: '#/components/responses/UserNotFound'
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
 *       "404":
 *         $ref: '#/components/responses/UserNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
