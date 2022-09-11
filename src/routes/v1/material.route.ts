import express from 'express';
import validate from '../../middlewares/validate';
import * as materialValidation from '../../validations/material.validation';
import * as materialController from '../../controllers/material.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(materialValidation.createMaterial), materialController.createMaterial)
  .get(validate(materialValidation.queryMaterials), materialController.queryMaterials);

router
  .route('/:material_id')
  .get(validate(materialValidation.getMaterial), materialController.getMaterialById)
  .patch(validate(materialValidation.updateMaterial), materialController.updateMaterialById)
  .delete(validate(materialValidation.deleteMaterial), materialController.deleteMaterialById);

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
 *               - author_id
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
 *               invite_id:
 *                 type: string
 *                 format: uuid
 *                 description: can be null
 *               author_id:
 *                 type: string
 *                 format: uuid
 *             example:
 *                material_title: plastic
 *                material_description: dangerous
 *                material_link: https://example.com
 *                source_id: 12ed7a55-a1ba-4895-83e9-7aa615247390
 *                type_id: e1889ecb-51ad-4c4f-a3c5-cb25971cb9a6
 *                invite_id: 12ed7a55-a1aa-4895-83e9-7aa615247390
 *                author_id: 9cf446ed-04f8-41fe-ba40-1c33e5670ca5
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
 *                 - $ref: '#/components/responses/InvitationNotFound'
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
 *               InvitationNotFound:
 *                 summary: invitation not found
 *                 value:
 *                   code: 404
 *                   message: invitation not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/AuthorAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/MaterialTypeAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/InvitationAlreadyAssignedToMaterial'
 *             examples:
 *               SourceAlreadyAssignedToMaterial:
 *                 summary: source already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a material
 *               AuthorAlreadyAssignedToMaterial:
 *                 summary: author already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: author already assigned to a material
 *               MaterialTypeAlreadyAssignedToMaterial:
 *                 summary: material type already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: material type already assigned to a material
 *               InvitationAlreadyAssignedToMaterial:
 *                 summary: invitation already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: invitation already assigned to a material
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
 *               invite_id:
 *                 type: string
 *                 format: uuid
 *                 description: can be null
 *               author_id:
 *                 type: string
 *                 format: uuid
 *             example:
 *                material_title: plastic
 *                material_description: dangerous
 *                material_link: https://example.com
 *                source_id: 12ed7a55-a1ba-4895-83e9-7aa615247390
 *                type_id: e1889ecb-51ad-4c4f-a3c5-cb25971cb9a6
 *                invite_id: 12ed7a55-a1aa-4895-83e9-7aa615247390
 *                author_id: 9cf446ed-04f8-41fe-ba40-1c33e5670ca5
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
 *                 - $ref: '#/components/responses/InvitationNotFound'
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
 *               InvitationNotFound:
 *                 summary: invitation not found
 *                 value:
 *                   code: 404
 *                   message: invitation not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/AuthorAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/MaterialTypeAlreadyAssignedToMaterial'
 *                 - $ref: '#/components/responses/InvitationAlreadyAssignedToMaterial'
 *             examples:
 *               SourceAlreadyAssignedToMaterial:
 *                 summary: source already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a material
 *               AuthorAlreadyAssignedToMaterial:
 *                 summary: author already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: author already assigned to a material
 *               MaterialTypeAlreadyAssignedToMaterial:
 *                 summary: material type already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: material type already assigned to a material
 *               InvitationAlreadyAssignedToMaterial:
 *                 summary: invitation already assigned to a material
 *                 value:
 *                   code: 409
 *                   message: invitation already assigned to a material
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a material by id
 *     description: Deletes a material by its id
 *     tags: [Material]
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
