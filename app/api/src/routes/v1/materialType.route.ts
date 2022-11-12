import express from 'express';
import validate from '../../middlewares/validate';
import * as materialTypeValidation from '../../validations/materialType.validation';
import * as materialTypeController from '../../controllers/materialType.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(materialTypeValidation.createMaterialType), materialTypeController.createMaterialType);

router
  .route('/:type_id')
  .get(validate(materialTypeValidation.getMaterialType), materialTypeController.getMaterialTypeById)
  .patch(auth(), validate(materialTypeValidation.updateMaterialType), materialTypeController.updateMaterialTypeById)
  .delete(auth(), validate(materialTypeValidation.deleteMaterialType), materialTypeController.deleteMaterialTypeById);

export default router;

/**
 * @swagger
 * tags:
 *   name: MaterialType
 *   description: Material Type management and retrieval
 */

/**
 * @swagger
 * /material-type:
 *   post:
 *     summary: Create a material type
 *     description: Creates a new material type.
 *     tags: [MaterialType]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_name
 *             properties:
 *               type_name:
 *                 type: string
 *               type_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                type_name: plastic
 *                type_description: dangerous to environment
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MaterialType'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /material-type/{type_id}:
 *   get:
 *     summary: Get a material type by id
 *     description: Get details about a material type by its id
 *     tags: [MaterialType]
 *     parameters:
 *       - in: path
 *         name: type_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Type id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MaterialType'
 *       "404":
 *         $ref: '#/components/responses/MaterialTypeNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a material type by id
 *     description: Update material type details by its id
 *     tags: [MaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Type id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type_name:
 *                 type: string
 *               type_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                type_name: plastic
 *                type_description: dangerous to environment
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MaterialType'
 *       "404":
 *         $ref: '#/components/responses/MaterialTypeNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a material type by id
 *     description: Deletes a material type by its id
 *     tags: [MaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Type id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/MaterialTypeNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
