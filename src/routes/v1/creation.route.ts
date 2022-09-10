import express from 'express';
import validate from '../../middlewares/validate';
import * as creationValidation from '../../validations/creation.validation';
import * as creationController from '../../controllers/creation.controller';

const router = express.Router();

router.route('/').post(validate(creationValidation.createCreation), creationController.createCreation);

router
  .route('/:creation_id')
  .get(validate(creationValidation.getCreation), creationController.getCreationById)
  .patch(validate(creationValidation.updateCreation), creationController.updateCreationById)
  .delete(validate(creationValidation.deleteCreation), creationController.deleteCreationById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Creation
 *   description: Creation management and retrieval
 */

/**
 * @swagger
 * /creation:
 *   post:
 *     summary: Create a creation
 *     description: Creates a new creation.
 *     tags: [Creation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creation_title
 *               - source_id
 *               - author_id
 *               - tags
 *               - materials
 *             properties:
 *               creation_title:
 *                 type: string
 *               creation_Description:
 *                 type: string
 *                 description: can be null
 *               source_id:
 *                 type: string
 *                 format: uuid
 *               author_id:
 *                 type: string
 *                 format: uuid
 *               tags:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               materials:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *             example:
 *                creation_title: my first creation
 *                creation_description: an example creation
 *                source_id: d91f005d-2037-41b9-b706-0e70c651e4e2
 *                author_id: dd7a824b-b0a9-4868-bdbf-cfa6bdd36629
 *                tags: [476790e7-a6dc-4aea-8421-06bacfa2daf6]
 *                materials: [7b3439c6-a691-4a60-9e09-8235804c33fe]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Creation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/TagNotFound'
 *                 - $ref: '#/components/responses/MaterialNotFound'
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
 *               TagNotFound:
 *                 summary: tag not found
 *                 value:
 *                   code: 404
 *                   message: tag not found
 *               MaterialNotFound:
 *                 summary: material not found
 *                 value:
 *                   code: 404
 *                   message: material not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/AuthorAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/TagAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
 *               SourceAlreadyAssignedToCreation:
 *                 summary: source already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a creation
 *               AuthorAlreadyAssignedToCreation:
 *                 summary: author already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: author already assigned to a creation
 *               TagAlreadyAssignedToCreation:
 *                 summary: tag already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: tag already assigned to a creation
 *               MaterialAlreadyAssignedToCreation:
 *                 summary: material already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a creation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /creation/{creation_id}:
 *   get:
 *     summary: Get a creation by id
 *     description: Get details about a creation by their id
 *     tags: [Creation]
 *     parameters:
 *       - in: path
 *         name: creation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Creation id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Creation'
 *       "404":
 *         $ref: '#/components/responses/CreationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a creation by id
 *     description: Update creation details by their id
 *     tags: [Creation]
 *     parameters:
 *       - in: path
 *         name: creation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Creation id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creation_title:
 *                 type: string
 *               creation_Description:
 *                 type: string
 *                 description: can be null
 *               source_id:
 *                 type: string
 *                 format: uuid
 *               author_id:
 *                 type: string
 *                 format: uuid
 *               tags:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               materials:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *             example:
 *                creation_title: my first creation
 *                creation_description: an example creation
 *                source_id: d91f005d-2037-41b9-b706-0e70c651e4e2
 *                author_id: dd7a824b-b0a9-4868-bdbf-cfa6bdd36629
 *                tags: [476790e7-a6dc-4aea-8421-06bacfa2daf6]
 *                materials: [7b3439c6-a691-4a60-9e09-8235804c33fe]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Creation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/CreationNotFound'
 *                 - $ref: '#/components/responses/SourceNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/TagNotFound'
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *             examples:
 *               CreationNotFound:
 *                 summary: creation not found
 *                 value:
 *                   code: 404
 *                   message: creation not found
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
 *               TagNotFound:
 *                 summary: tag not found
 *                 value:
 *                   code: 404
 *                   message: tag not found
 *               MaterialNotFound:
 *                 summary: material not found
 *                 value:
 *                   code: 404
 *                   message: material not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/SourceAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/AuthorAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/TagAlreadyAssignedToCreation'
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
 *               SourceAlreadyAssignedToCreation:
 *                 summary: source already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a creation
 *               AuthorAlreadyAssignedToCreation:
 *                 summary: author already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: author already assigned to a creation
 *               TagAlreadyAssignedToCreation:
 *                 summary: tag already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: tag already assigned to a creation
 *               MaterialAlreadyAssignedToCreation:
 *                 summary: material already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a creation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a creation by id
 *     description: Deletes a creation by their id
 *     tags: [Creation]
 *     parameters:
 *       - in: path
 *         name: creation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Creation id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/CreationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
