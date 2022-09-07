import express from 'express';
import validate from '../../middlewares/validate';
import * as decisionValidation from '../../validations/decision.validation';
import * as decisionController from '../../controllers/decision.controller';

const router = express.Router();

router.route('/').post(validate(decisionValidation.createDecision), decisionController.createDecision);

router
  .route('/:decision_id')
  .get(validate(decisionValidation.getDecision), decisionController.getDecisionById)
  .patch(validate(decisionValidation.updateDecision), decisionController.updateDecisionById)
  .delete(validate(decisionValidation.deleteDecision), decisionController.deleteDecisionById);

export default router;
