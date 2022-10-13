import express from 'express';
import validate from '../../middlewares/validate';
import * as creationValidation from '../../validations/creation.validation';
import * as creationController from '../../controllers/creation.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(creationValidation.createCreation), creationController.createCreation)
  .get(validate(creationValidation.queryCreations), creationController.queryCreations);

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
 *   description: Creations management and retrieval
 */

/**
 * @swagger
 * /creations:
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
 *               - creation_date
 *             properties:
 *               creation_title:
 *                 type: string
 *               creation_description:
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
 *               creation_date:
 *                 type: string
 *                 format: date-time
 *               is_draft:
 *                 type: bool
 *               is_claimable:
 *                 type: bool
 *             example:
 *                creation_title: my first creation
 *                creation_description: an example creation
 *                source_id: d91f005d-2037-41b9-b706-0e70c651e4e2
 *                author_id: dd7a824b-b0a9-4868-bdbf-cfa6bdd36629
 *                tags: [476790e7-a6dc-4aea-8421-06bacfa2daf6]
 *                materials: [7b3439c6-a691-4a60-9e09-8235804c33fe]
 *                creation_date: 2022-09-09T19:00:00.000Z
 *                is_draft: false
 *                is_claimable: true
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
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
 *               SourceAlreadyAssignedToCreation:
 *                 summary: source already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a creation
 *               MaterialAlreadyAssignedToCreation:
 *                 summary: material already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a creation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all creations
 *     description: Returns a list of creations.
 *     tags: [Creation]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of creations
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
 *         name: ascend_fields
 *         schema:
 *           type: string[]
 *         description: list of fields to order by ascending
 *       - in: query
 *         name: descend_fields
 *         schema:
 *           type: string[]
 *         description: list of fields to order by descending
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
 *                     $ref: '#/components/schemas/Creation'
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
 * /creations/{creation_id}:
 *   get:
 *     summary: Get a creation by id
 *     description: Get details about a creation by its id
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
 *     description: Update creation details by its id
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
 *               creation_description:
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
 *               creation_date:
 *                 type: string
 *                 format: date-time
 *               is_draft:
 *                 type: bool
 *               is_claimable:
 *                 type: bool
 *             example:
 *                creation_title: my first creation
 *                creation_description: an example creation
 *                source_id: d91f005d-2037-41b9-b706-0e70c651e4e2
 *                author_id: dd7a824b-b0a9-4868-bdbf-cfa6bdd36629
 *                tags: [476790e7-a6dc-4aea-8421-06bacfa2daf6]
 *                materials: [7b3439c6-a691-4a60-9e09-8235804c33fe]
 *                creation_date: 2022-09-09T19:00:00.000Z
 *                is_draft: false
 *                is_claimable: false
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
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
 *               SourceAlreadyAssignedToCreation:
 *                 summary: source already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: source already assigned to a creation
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
 *     description: Deletes a creation by its id
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
