import express from 'express';
import validate from '../../middlewares/validate';
import * as tagValidation from '../../validations/tag.validation';
import * as tagController from '../../controllers/tag.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(tagValidation.createTag), tagController.createTag)
  .get(validate(tagValidation.queryTags), tagController.queryTags);

router
  .route('/:tag_id')
  .get(validate(tagValidation.getTag), tagController.getTagById)
  .patch(auth(), validate(tagValidation.updateTag), tagController.updateTagById)
  .delete(auth(), validate(tagValidation.deleteTag), tagController.deleteTagById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Tag
 *   description: Tags management and retrieval
 */

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a tag
 *     description: Creates a new tag.
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag_name
 *             properties:
 *               tag_name:
 *                 type: string
 *               tag_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                tag_name: enhancement
 *                tag_description: improvement tag
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tag'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all tags
 *     description: Returns a list of tags.
 *     tags: [Tag]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tags
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
 *                     $ref: '#/components/schemas/Tag'
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
 * /tags/{tag_id}:
 *   get:
 *     summary: Get a tag by id
 *     description: Get details about a tag by their id
 *     tags: [Tag]
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tag'
 *       "404":
 *         $ref: '#/components/responses/TagNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a tag by id
 *     description: Update tag details by their id
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag_name:
 *                 type: string
 *               tag_description:
 *                 type: string
 *                 description: can be null
 *             example:
 *                tag_name: enhancement
 *                tag_description: improvement tag
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tag'
 *       "404":
 *         $ref: '#/components/responses/TagNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a tag by id
 *     description: Deletes a tag by their id
 *     tags: [Tag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tag_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/TagNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
