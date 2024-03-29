import express from 'express';
import userRoute from './user.route';
import decisionRoute from './decision.route';
import recognitionRoute from './recognition.route';
import materialRoute from './material.route';
import notificationRoute from './notification.route';
import tagRoute from './tag.route';
import creationRoute from './creation.route';
import litigationRoute from './litigation.route';
import tokenRoute from './token.route';
import authRoute from './auth.route';
import docsRoute from './docs.route';
import filesRoute from './files.route';
import transactionRoute from './transaction.route';
import webhookRoute from './webhook.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/decision',
    route: decisionRoute,
  },
  {
    path: '/recognitions',
    route: recognitionRoute,
  },
  {
    path: '/materials',
    route: materialRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/tags',
    route: tagRoute,
  },
  {
    path: '/creations',
    route: creationRoute,
  },
  {
    path: '/litigations',
    route: litigationRoute,
  },
  {
    path: '/token',
    route: tokenRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/files',
    route: filesRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
  {
    path: '/webhooks',
    route: webhookRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
