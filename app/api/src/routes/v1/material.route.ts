import express from 'express';
import validate from '../../middlewares/validate';
import * as materialValidation from '../../validations/material.validation';
import * as materialController from '../../controllers/material.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(materialValidation.createMaterial), materialController.createMaterial)
  .get(validate(materialValidation.queryMaterials), materialController.queryMaterials);

router
  .route('/:material_id')
  .get(validate(materialValidation.getMaterial), materialController.getMaterialById)
  .patch(auth(), validate(materialValidation.updateMaterial), materialController.updateMaterialById)
  .delete(auth(), validate(materialValidation.deleteMaterial), materialController.deleteMaterialById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Material
 *   description: Material management and retrieval
 */

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create a material
 *     description: Creates a new material.
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material_title
 *               - source_id
 *               - type_id
 *             properties:
 *               material_title:
 *                 type: string
 *               material_description:
 *                 type: string
 *                 description: can be null
 *               material_link:
 *                 type: string
 *                 description: can be null
 *               source_id:
 *                 type: string
 *                 format: uuid
 *               type_id:
 *                 type: string
 *                 format: uuid
 *               recognition_id:
 *                 type: string
 *                 format: uuid
 *                 description: can be null
 *               is_claimable:
 *                 type: bool
 *             example:
 *                material_title: plastic
 *                material_description: dangerous
 *                material_link: https://example.com
 *                source_id: 12ed7a55-a1ba-4895-83e9-7aa615247390
 *                type_id: e1889ecb-51ad-4c4f-a3c5-cb25971cb9a6
 *                recognition_id: 12ed7a55-a1aa-4895-83e9-7aa615247390
 *                is_claimable: true
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Material'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/MaterialTypeNotFound'
 *                 - $ref: '#/components/responses/RecognitionNotFound'
 *             examples:
 *               SourceNotFound:
 *                 summary: source not found
 *                 value:
 *                   code: 404
 *                   message: source not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *               MaterialTypeNotFound:
 *                 summary: material type not found
 *                 value:
 *                   code: 404
 *                   message: material type not found
 *               RecognitionNotFound:
 *                 summary: recognition not found
 *                 value:
 *                   code: 404
 *                   message: recognition not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/MaterialTypeAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/RecognitionAlreadyAssignedToMaterial'
 *             examples:
 *               SourceAlreadyAssignedToMaterial:
 *                 summary: source already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a material
 *               MaterialTypeAlreadyAssignedToMaterial:
 *                 summary: material type already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: material type already assigned to a material
 *               RecognitionAlreadyAssignedToMaterial:
 *                 summary: recognition already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: recognition already assigned to a material
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all materials
 *     description: Returns a list of materials.
 *     tags: [Material]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of materials
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
 *         name: is_recognized
 *         schema:
 *           type: bool
 *         description: when true, returns materials that are recognized by co-authors (recognition accepted by co-authors)
 *       - in: query
 *         name: is_claimed
 *         schema:
 *           type: bool
 *         description: when true, returns materials that are claimed by original authors (in litigation process)
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - source_id
 *               - type_id
 *               - recognition_id
 *               - recognition_id.recognition_by
 *               - recognition_id.recognition_for
 *               - recognition_id.status_id
 *               - author_id
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
 *                     $ref: '#/components/schemas/Material'
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
 * /materials/{material_id}:
 *   get:
 *     summary: Get a material by id
 *     description: Get details about a material by its id
 *     tags: [Material]
 *     parameters:
 *       - in: path
 *         name: material_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material id
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - source_id
 *               - type_id
 *               - recognition_id
 *               - recognition_id.recognition_by
 *               - recognition_id.recognition_for
 *               - recognition_id.status_id
 *               - author_id
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Material'
 *       "404":
 *         $ref: '#/components/responses/MaterialNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a material by id
 *     description: Update user details by its id
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: material_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               material_title:
 *                 type: string
 *               material_description:
 *                 type: string
 *                 description: can be null
 *               material_link:
 *                 type: string
 *                 description: can be null
 *               source_id:
 *                 type: string
 *                 format: uuid
 *               type_id:
 *                 type: string
 *                 format: uuid
 *               recognition_id:
 *                 type: string
 *                 format: uuid
 *                 description: can be null
 *               is_claimable:
 *                 type: bool
 *             example:
 *                material_title: plastic
 *                material_description: dangerous
 *                material_link: https://example.com
 *                source_id: 12ed7a55-a1ba-4895-83e9-7aa615247390
 *                type_id: e1889ecb-51ad-4c4f-a3c5-cb25971cb9a6
 *                recognition_id: 12ed7a55-a1aa-4895-83e9-7aa615247390
 *                is_claimable: false
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Material'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *                 - $ref: '#/components/responses/SourceNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/MaterialTypeNotFound'
 *                 - $ref: '#/components/responses/RecognitionNotFound'
 *             examples:
 *               MaterialNotFound:
 *                 summary: material not found
 *                 value:
 *                   code: 404
 *                   message: material not found
 *               SourceNotFound:
 *                 summary: source not found
 *                 value:
 *                   code: 404
 *                   message: source not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *               MaterialTypeNotFound:
 *                 summary: material type not found
 *                 value:
 *                   code: 404
 *                   message: material type not found
 *               RecognitionNotFound:
 *                 summary: recognition not found
 *                 value:
 *                   code: 404
 *                   message: recognition not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/MaterialTypeAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/RecognitionAlreadyAssignedToMaterial'
 *             examples:
 *               SourceAlreadyAssignedToMaterial:
 *                 summary: source already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a material
 *               MaterialTypeAlreadyAssignedToMaterial:
 *                 summary: material type already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: material type already assigned to a material
 *               RecognitionAlreadyAssignedToMaterial:
 *                 summary: recognition already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: recognition already assigned to a material
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a material by id
 *     description: Deletes a material by its id
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: material_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/MaterialNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
