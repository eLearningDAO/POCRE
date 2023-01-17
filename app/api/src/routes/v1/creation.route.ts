import express from 'express';
import * as creationController from '../../controllers/creation.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as creationValidation from '../../validations/creation.validation';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(creationValidation.createCreation), creationController.createCreation)
  .get(auth({ is_optional: true }), validate(creationValidation.queryCreations), creationController.queryCreations);

router
  .route('/:creation_id')
  .get(validate(creationValidation.getCreation), creationController.getCreationById)
  .patch(auth(), validate(creationValidation.updateCreation), creationController.updateCreationById)
  .delete(auth(), validate(creationValidation.deleteCreation), creationController.deleteCreationById);

router
  .route('/:creation_id/onchain')
  .post(auth(), validate(creationValidation.publishCreationOnchain), creationController.publishCreationOnchain);

router
  .route('/:creation_id/proof')
  .get(validate(creationValidation.getCreationProof), creationController.getCreationProofById);

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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creation_title
 *               - creation_link
 *               - tags
 *               - creation_date
 *             properties:
 *               creation_title:
 *                 type: string
 *               creation_description:
 *                 type: string
 *                 description: can be null
 *               creation_link:
 *                 type: string
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
 *                creation_link: https://example.com
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
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/TagNotFound'
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *             examples:
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
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
 *               MaterialAlreadyAssignedToCreation:
 *                 summary: material already assigned to a creation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a creation
 *       "500":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/InternalServerError'
 *                 - $ref: '#/components/responses/CreationIPFSFailedUpload'
 *             examples:
 *               InternalServerError:
 *                 summary: internal server error
 *                 value:
 *                   code: 500
 *                   message: internal server error
 *               CreationIPFSFailedUpload:
 *                 summary: failed to upload creation to ipfs
 *                 value:
 *                   code: 500
 *                   message: failed to upload creation to ipfs
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
 *       - in: query
 *         name: is_trending
 *         schema:
 *           type: bool
 *         description: when true, returns opened creations not in litigation process
 *       - in: query
 *         name: is_partially_assigned
 *         schema:
 *           type: bool
 *         description: when true, returns opened creations of which some materials are recognized by co-authors (recognition accepted by co-authors)
 *       - in: query
 *         name: is_fully_assigned
 *         schema:
 *           type: bool
 *         description: when true, returns opened creations of which all materials are recognized by co-authors (recognition accepted by co-authors)
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - author_id
 *               - tags
 *               - materials
 *               - materials.recognition_id
 *               - materials.recognition_id.recognition_by
 *               - materials.recognition_id.recognition_for
 *               - materials.author_id
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
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - author_id
 *               - tags
 *               - materials
 *               - materials.recognition_id
 *               - materials.recognition_id.recognition_by
 *               - materials.recognition_id.recognition_for
 *               - materials.author_id
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
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
 *     security:
 *       - bearerAuth: []
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
 *               creation_link:
 *                 type: string
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
 *                creation_link: https://example.com
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
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/TagNotFound'
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *             examples:
 *               CreationNotFound:
 *                 summary: creation not found
 *                 value:
 *                   code: 404
 *                   message: creation not found
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
 *       "406":
 *         $ref: '#/components/responses/PublishedCreationNotAllowedUpdate'
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToCreation'
 *             examples:
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
 *     security:
 *       - bearerAuth: []
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
 *       "406":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/CreationOngoingMaterialRecognition'
 *                 - $ref: '#/components/responses/CreationOngoingLitigation'
 *             examples:
 *               CreationOngoingMaterialRecognition:
 *                 summary: creation has ongoing material recognition process
 *                 value:
 *                   code: 409
 *                   message: creation has ongoing material recognition process
 *               CreationOngoingLitigation:
 *                 summary: creation has ongoing litigation process
 *                 value:
 *                   code: 409
 *                   message: creation has ongoing litigation process
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /creations/{creation_id}/proof:
 *   get:
 *     summary: Get a creation proof by id
 *     description: Get a creation proof by id in various formats
 *     tags: [Creation]
 *     parameters:
 *       - in: path
 *         name: creation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Creation id
 *       - in: query
 *         name: format
 *         default: web
 *         schema:
 *           type: string
 *           enum:
 *             - web
 *             - json
 *         description: The required format for proof of creation. When format is web, an html document will be returned instead of json
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/CreationProof'
 *       "404":
 *         $ref: '#/components/responses/CreationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
