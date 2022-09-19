import express from 'express';
import validate from '../../middlewares/validate';
import * as invitationValidation from '../../validations/invitation.validation';
import * as invitationController from '../../controllers/invitation.controller';

const router = express.Router();

router
  .route('/')
  .post(validate(invitationValidation.createInvitation), invitationController.createInvitation)
  .get(validate(invitationValidation.queryInvitations), invitationController.queryInvitations);

router
  .route('/:invite_id')
  .get(validate(invitationValidation.getInvitation), invitationController.getInvitationById)
  .patch(validate(invitationValidation.updateInvitation), invitationController.updateInvitationById)
  .delete(validate(invitationValidation.deleteInvitation), invitationController.deleteInvitationById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Invitation
 *   description: Invitation management and retrieval
 */

/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: Create an invitation
 *     description: Creates a new invitation.
 *     tags: [Invitation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invite_from
 *               - invite_to
 *               - status_id
 *             properties:
 *               invite_from:
 *                 type: uuid
 *               invite_to:
 *                 type: uuid
 *               invite_description:
 *                 type: string
 *                 description: can be null
 *               status_id:
 *                 type: uuid
 *             example:
 *                invite_from: d5cef9e4-d497-45ea-bd68-609aba268886
 *                invite_to: d5cef9e4-d497-45ea-bd68-609aba268887
 *                invite_description: null
 *                status_id: 865b3cff-d24e-4ec7-8873-f9634c5f2245
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/StatusNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *             examples:
 *               StatusNotFound:
 *                 summary: status not found
 *                 value:
 *                   code: 404
 *                   message: status not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/StatusAlreadyAssignedToInvitation'
 *             examples:
 *               StatusAlreadyAssignedToInvitation:
 *                 summary: status already assigned to an invitation
 *                 value:
 *                   code: 409
 *                   message: status already assigned to an invitation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all invitations
 *     description: Returns a list of invitations.
 *     tags: [Invitation]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of invitations
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
 *                     $ref: '#/components/schemas/Invitation'
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
 * /invitations/{invite_id}:
 *   get:
 *     summary: Get an invitation by id
 *     description: Get details about an invitation by its id
 *     tags: [Invitation]
 *     parameters:
 *       - in: path
 *         name: invite_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invite id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "404":
 *         $ref: '#/components/responses/InvitationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update an invitation by id
 *     description: Update invitation details by its id
 *     tags: [Invitation]
 *     parameters:
 *       - in: path
 *         name: invite_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invite id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invite_from:
 *                 type: uuid
 *               invite_to:
 *                 type: uuid
 *               invite_description:
 *                 type: string
 *                 description: can be null
 *               status_id:
 *                 type: uuid
 *             example:
 *                invite_from: d5cef9e4-d497-45ea-bd68-609aba268886
 *                invite_to: d5cef9e4-d497-45ea-bd68-609aba268887
 *                invite_description: null
 *                status_id: 865b3cff-d24e-4ec7-8873-f9634c5f2245
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/InvitationNotFound'
 *                 - $ref: '#/components/responses/StatusNotFound'
 *                 - $ref: '#/components/responses/UserNotFound'
 *             examples:
 *               InvitationNotFound:
 *                 summary: invitation not found
 *                 value:
 *                   code: 404
 *                   message: invitation not found
 *               StatusNotFound:
 *                 summary: status not found
 *                 value:
 *                   code: 404
 *                   message: status not found
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *       "409":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/StatusAlreadyAssignedToInvitation'
 *             examples:
 *               StatusAlreadyAssignedToInvitation:
 *                 summary: status already assigned to an invitation
 *                 value:
 *                   code: 409
 *                   message: status already assigned to an invitation
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete an invitation by id
 *     description: Deletes an invitation by its id
 *     tags: [Invitation]
 *     parameters:
 *       - in: path
 *         name: invite_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invite id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/InvitationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
