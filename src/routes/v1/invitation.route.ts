import express from 'express';
import validate from '../../middlewares/validate';
import * as invitationValidation from '../../validations/invitation.validation';
import * as invitationController from '../../controllers/invitation.controller';

const router = express.Router();

router.route('/').post(validate(invitationValidation.createInvitation), invitationController.createInvitation);

router
  .route('/:invite_id')
  .get(validate(invitationValidation.getInvitation), invitationController.getInvitationById)
  .patch(validate(invitationValidation.updateInvitation), invitationController.updateInvitationById)
  .delete(validate(invitationValidation.deleteInvitation), invitationController.deleteInvitationById);

export default router;
