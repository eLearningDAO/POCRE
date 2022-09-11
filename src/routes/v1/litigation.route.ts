import express from 'express';
import validate from '../../middlewares/validate';
import * as litigationValidation from '../../validations/litigation.validation';
import * as litigationController from '../../controllers/litigation.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(litigationValidation.createLitigation), litigationController.createLitigation)
  .get(validate(litigationValidation.queryLitigations), litigationController.queryLitigations);

router
  .route('/:litigation_id')
  .get(validate(litigationValidation.getLitigation), litigationController.getLitigationById)
  .patch(validate(litigationValidation.updateLitigation), litigationController.updateLitigationById)
  .delete(validate(litigationValidation.deleteLitigation), litigationController.deleteLitigationById);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - litigation_title
 *               - material_id
 *               - issuer_id
 *               - decisions
 *               - invitations
 *             properties:
 *               litigation_title:
 *                 type: string
 *               litigation_description:
 *                 type: string
 *                 description: can be null
 *               material_id:
 *                 type: string
 *                 format: uuid
 *               issuer_id:
 *                 type: string
 *                 format: uuid
 *               decisions:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               invitations:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               litigation_end:
 *                 type: string
 *                 format: date-time
 *               reconcilate:
 *                 type: bool
 *             example:
 *                litigation_title: my first litigation
 *                litigation_description: an example litigation
 *                material_id: fa52d76c-664a-41de-aebb-b311a74ef570
 *                issuer_id: b49cf4d8-341d-4cd6-b5ad-d002e87d933c
 *                decisions: [6087ac9e-7e15-4ad7-b256-7893a00c3577]
 *                invitations: [37a38a64-c2ea-4883-881b-2b1d5362db44]
 *                litigation_end: 2022-09-09T19:00:00.000Z
 *                reconcilate: false
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
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/DecisionNotFound'
 *                 - $ref: '#/components/responses/InvitationNotFound'
 *             examples:
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
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/IssuerAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/DecisionAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/InvitationAlreadyAssignedToLitigation'
 *             examples:
 *               MaterialAlreadyAssignedToLitigation:
 *                 summary: material already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a litigation
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
 *               InvitationAlreadyAssignedToLitigation:
 *                 summary: invitation already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: invitation already assigned to a litigation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all litigations
 *     description: Returns a list of litigations.
 *     tags: [Litigation]
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
 *               material_id:
 *                 type: string
 *                 format: uuid
 *               issuer_id:
 *                 type: string
 *                 format: uuid
 *               decisions:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               invitations:
 *                 type: array
 *                 items:
 *                    type: string
 *                    format: uuid
 *               litigation_end:
 *                 type: string
 *                 format: date-time
 *               reconcilate:
 *                 type: bool
 *             example:
 *                litigation_title: my first litigation
 *                litigation_description: an example litigation
 *                material_id: fa52d76c-664a-41de-aebb-b311a74ef570
 *                issuer_id: b49cf4d8-341d-4cd6-b5ad-d002e87d933c
 *                decisions: [6087ac9e-7e15-4ad7-b256-7893a00c3577]
 *                invitations: [37a38a64-c2ea-4883-881b-2b1d5362db44]
 *                litigation_end: 2022-09-09T19:00:00.000Z
 *                reconcilate: false
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
 *                 - $ref: '#/components/responses/MaterialNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/DecisionNotFound'
 *                 - $ref: '#/components/responses/InvitationNotFound'
 *             examples:
 *               LitigationNotFound:
 *                 summary: litigation not found
 *                 value:
 *                   code: 404
 *                   message: litigation not found
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
 *                 - $ref: '#/components/responses/MaterialAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/IssuerAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/DecisionAlreadyAssignedToLitigation'
 *                 - $ref: '#/components/responses/InvitationAlreadyAssignedToLitigation'
 *             examples:
 *               MaterialAlreadyAssignedToLitigation:
 *                 summary: material already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: material already assigned to a litigation
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
 *               InvitationAlreadyAssignedToLitigation:
 *                 summary: invitation already assigned to a litigation
 *                 value:
 *                   code: 409
 *                   message: invitation already assigned to a litigation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a litigation by id
 *     description: Deletes a litigation by its id
 *     tags: [Litigation]
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
