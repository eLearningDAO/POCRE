import express from 'express';
import validate from '../../middlewares/validate';
import * as litigationValidation from '../../validations/litigation.validation';
import * as litigationController from '../../controllers/litigation.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(litigationValidation.createLitigation), litigationController.createLitigation)
  .get(auth(), validate(litigationValidation.queryLitigations), litigationController.queryLitigations);

router
  .route('/:litigation_id')
  .get(auth(), validate(litigationValidation.getLitigation), litigationController.getLitigationById)
  .patch(auth(), validate(litigationValidation.updateLitigation), litigationController.updateLitigationById)
  .delete(auth(), validate(litigationValidation.deleteLitigation), litigationController.deleteLitigationById);

router
  .route('/:litigation_id/respond')
  .post(auth(), validate(litigationValidation.respondToLitigation), litigationController.respondToLitigationById);

router
  .route('/:litigation_id/vote')
  .post(auth(), validate(litigationValidation.voteOnLitigation), litigationController.voteOnLitigationById);

router
  .route('/:litigation_id/claim-ownership')
  .post(
    auth(),
    validate(litigationValidation.claimLitigatedItemOwnership),
    litigationController.claimLitigatedItemOwnershipById
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Litigation
 *   description: Litigation management and retrieval
 */

/**
 * @swagger
 * /litigations:
 *   post:
 *     summary: Create a litigation
 *     description: Creates a new litigation.
 *     tags: [Litigation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - litigation_title
 *               - creation_id
 *               - voting_start
 *               - voting_end
 *             properties:
 *               litigation_title:
 *                 type: string
 *               litigation_description:
 *                 type: string
 *                 description: can be null
 *               creation_id:
 *                 type: string
 *                 format: uuid
 *               material_id:
 *                 type: string
 *                 format: uuid
 *               decisions:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               voting_start:
 *                 type: string
 *                 format: date-time
 *               voting_end:
 *                 type: string
 *                 format: date-time
 *               reconcilate:
 *                 type: bool
 *             example:
 *                litigation_title: my first litigation
 *                litigation_description: an example litigation
 *                creation_id: fa52d76c-664a-41de-aebb-b311a74ef571
 *                material_id: fa52d76c-664a-41de-aebb-b311a74ef570
 *                decisions: [6087ac9e-7e15-4ad7-b256-7893a00c3577]
 *                voting_start: 2022-09-09T19:00:00.000Z
 *                voting_end: 2022-09-09T19:00:00.000Z
 *                reconcilate: false
 *                ownership_transferred: false
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Litigation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/CreationNotFound'
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/DecisionNotFound'
 *             examples:
 *               CreationNotFound:
 *                 summary: creation not found
 *                 value:
 *                   code: 404
 *                   message: creation not found
 *               MaterialNotFound:
 *                 summary: material not found
 *                 value:
 *                   code: 404
 *                   message: material not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *               DecisionNotFound:
 *                 summary: deicison not found
 *                 value:
 *                   code: 404
 *                   message: deicison not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/CreationAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/CreationAlreadyOwned'
 *                 - $ref: '#/components/responses/CreationLitigationNotAllowed'
 *                 - $ref: '#/components/responses/MaterialDoesNotBelongToCreation'
 *                 - $ref: '#/components/responses/CreationNotClaimable'
 *                 - $ref: '#/components/responses/MaterialNotClaimable'
 *                 - $ref: '#/components/responses/MaterialAlreadyOwned'
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/IssuerAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/DecisionAlreadyAssignedToLitigation'
 *             examples:
 *               CreationAlreadyAssignedToLitigation:
 *                 summary: creation already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: creation already assigned to a litigation
 *               CreationAlreadyOwned:
 *                 summary: creation is already owned
 *                 value:
 *                   code: 409
 *                   message: creation is already owned
 *               CreationLitigationNotAllowed:
 *                 summary: creation with materials are not allowed to be litigated
 *                 value:
 *                   code: 409
 *                   message: creation with materials are not allowed to be litigated
 *               CreationNotClaimable:
 *                 summary: creation is not claimable
 *                 value:
 *                   code: 409
 *                   message: creation is not claimable
 *               MaterialDoesNotBelongToCreation:
 *                 summary: material does not belong to creation
 *                 value:
 *                   code: 409
 *                   message: material does not belong to creation
 *               MaterialAlreadyAssignedToLitigation:
 *                 summary: material already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a litigation
 *               MaterialNotClaimable:
 *                 summary: material is not claimable
 *                 value:
 *                   code: 409
 *                   message: material is not claimable
 *               MaterialAlreadyOwned:
 *                 summary: material is already owned
 *                 value:
 *                   code: 409
 *                   message: material is already owned
 *               IssuerAlreadyAssignedToLitigation:
 *                 summary: issuer already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: issuer already assigned to a litigation
 *               DecisionAlreadyAssignedToLitigation:
 *                 summary: decision already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: decision already assigned to a litigation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all litigations
 *     description: Returns a list of litigations.
 *     tags: [Litigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of litigations
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
 *         name: judged_by
 *         schema:
 *           type: bool
 *         description: when present, returns litigations that are to be judged by the specified user
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - assumed_author
 *               - issuer_id
 *               - winner
 *               - creation_id
 *               - creation_id.author_id
 *               - creation_id.tags
 *               - creation_id.materials
 *               - creation_id.materials.recognition_id
 *               - creation_id.materials.recognition_id.recognition_by
 *               - creation_id.materials.recognition_id.recognition_for
 *               - creation_id.materials.author_id
 *               - material_id
 *               - material_id.recognition_id
 *               - material_id.recognition_id.recognition_by
 *               - material_id.recognition_id.recognition_for
 *               - material_id.author_id
 *               - recognitions
 *               - recognitions.recognition_by
 *               - recognitions.recognition_for
 *               - decisions
 *               - decisions.maker_id
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
 *                     $ref: '#/components/schemas/Litigation'
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
 * /litigations/{litigation_id}:
 *   get:
 *     summary: Get a litigation by id
 *     description: Get details about a litigation by its id
 *     tags: [Litigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: litigation id
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - assumed_author
 *               - issuer_id
 *               - winner
 *               - creation_id
 *               - creation_id.author_id
 *               - creation_id.tags
 *               - creation_id.materials
 *               - creation_id.materials.recognition_id
 *               - creation_id.materials.recognition_id.recognition_by
 *               - creation_id.materials.recognition_id.recognition_for
 *               - creation_id.materials.author_id
 *               - material_id
 *               - material_id.recognition_id
 *               - material_id.recognition_id.recognition_by
 *               - material_id.recognition_id.recognition_for
 *               - material_id.author_id
 *               - recognitions
 *               - recognitions.recognition_by
 *               - recognitions.recognition_for
 *               - decisions
 *               - decisions.maker_id
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Litigation'
 *       "404":
 *         $ref: '#/components/responses/LitigationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a litigation by id
 *     description: Update litigation details by its id
 *     tags: [Litigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: litigation id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               litigation_title:
 *                 type: string
 *               litigation_description:
 *                 type: string
 *                 description: can be null
 *               decisions:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               voting_start:
 *                 type: string
 *                 format: date-time
 *               voting_end:
 *                 type: string
 *                 format: date-time
 *               reconcilate:
 *                 type: bool
 *               ownership_transferred:
 *                 type: bool
 *             example:
 *                litigation_title: my first litigation
 *                litigation_description: an example litigation
 *                material_id: fa52d76c-664a-41de-aebb-b311a74ef570
 *                assumed_author: b49cf4d8-341d-4cd6-b5ad-d002e87d933c
 *                decisions: [6087ac9e-7e15-4ad7-b256-7893a00c3577]
 *                voting_start: 2022-09-09T19:00:00.000Z
 *                voting_end: 2022-09-09T19:00:00.000Z
 *                reconcilate: false
 *                ownership_transferred: false
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Litigation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/LitigationNotFound'
 *                 - $ref: '#/components/responses/DecisionNotFound'
 *             examples:
 *               LitigationNotFound:
 *                 summary: litigation not found
 *                 value:
 *                   code: 404
 *                   message: litigation not found
 *               DecisionNotFound:
 *                 summary: deicison not found
 *                 value:
 *                   code: 404
 *                   message: deicison not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/MaterialDoesNotBelongToCreation'
 *                 - $ref: '#/components/responses/DecisionAlreadyAssignedToLitigation'
 *             examples:
 *               MaterialDoesNotBelongToCreation:
 *                 summary: material does not belong to creation
 *                 value:
 *                   code: 409
 *                   message: material does not belong to creation
 *               DecisionAlreadyAssignedToLitigation:
 *                 summary: decision already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: decision already assigned to a litigation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a litigation by id
 *     description: Deletes a litigation by its id
 *     tags: [Litigation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: litigation id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/LitigationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
