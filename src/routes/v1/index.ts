import express from 'express';
import userRoute from './user.route';
import statusRoute from './status.route';
import decisionRoute from './decision.route';
import invitationRoute from './invitation.route';
import sourceRoute from './source.route';
import materialTypeRoute from './materialType.route';
import materialRoute from './material.route';
import tagRoute from './tag.route';
import creationRoute from './creation.route';
import docsRoute from './docs.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/status',
    route: statusRoute,
  },
  {
    path: '/decision',
    route: decisionRoute,
  },
  {
    path: '/invitation',
    route: invitationRoute,
  },
  {
    path: '/source',
    route: sourceRoute,
  },
  {
    path: '/material-type',
    route: materialTypeRoute,
  },
  {
    path: '/material',
    route: materialRoute,
  },
  {
    path: '/tags',
    route: tagRoute,
  },
  {
    path: '/creation',
    route: creationRoute,
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
