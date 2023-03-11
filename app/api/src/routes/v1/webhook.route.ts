import express from 'express';
import * as webhookController from '../../controllers/webhook.controller';

const router = express.Router();

router.route('/transaction').post(webhookController.processTransaction);

export default router;
