import express from 'express';
import validate from '../../middlewares/validate';
import * as notificationValidation from '../../validations/notification.validation';
import * as notificationController from '../../controllers/notification.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(notificationValidation.createNotification), notificationController.createNotification)
  .get(validate(notificationValidation.queryNotifications), notificationController.querynotifications);

router
  .route('/:notification_id')
  .get(validate(notificationValidation.getNotification), notificationController.getNotificationById)
  .patch(auth(), validate(notificationValidation.updateNotification), notificationController.updateNotificationById)
  .delete(auth(), validate(notificationValidation.deleteNotification), notificationController.deleteNotificationById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification Management and retrieval
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a Notification
 *     description: Creates a new notification.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification_title
 *               - notification_link
 *               - notification_for
 *               - status
 *               - creation_type
 *               - creation_link
 *               - notification_link
 *             example:
 *                notification_title: plastic
 *                notification_description: dangerous
 *                notification_for: 9cf446ed-04f8-41fe-ba40-1c33e5670ca5
 *                status: 'unread'
 *                creation_type: 'image'
 *                creation_link: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'
 *                notification_link: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Notification'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/UserNotFound'
 *                 - $ref: '#/components/responses/RecognitionNotFound'
 *             examples:
 *               UserNotFound:
 *                 summary: user not found
 *                 value:
 *                   code: 404
 *                   message: user not found
 *               RecognitionNotFound:
 *                 summary: recognition not found
 *                 value:
 *                   code: 404
 *                   message: recognition not found
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all notifications
 *     description: Returns a list of notifications.
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of notifications
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
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - notification_for
 *               - notification_title
 *               - notification_description
 *               - creation_type
 *               - creation_link
 *               - notification_link
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
 *                     $ref: '#/components/schemas/Notification'
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
 * /notifications/{notification_id}:
 *   get:
 *     summary: Get a notification by id
 *     description: Get details about a notification by its id
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *       - in: query
 *         name: populate
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - notification_for
 *               - notification_title
 *               - notification_description
 *               - creation_type
 *               - creation_link
 *               - notification_link
 *         description: list of fields to populate - if the populated field has an '_id' in its name then it will be removed in response
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Notification'
 *       "404":
 *         $ref: '#/components/responses/NotificationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update a notificaton by id
 *     description: Update notificaton details by its id
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_title:
 *                 type: string
 *               notification_description:
 *                 type: string
 *                 description: can be null
 *               status:
 *                 type: string
 *                 description: can be null
 *               notification_for:
 *                 type: string
 *                 format: uuid
 *                 description: can be null
 *             example:
 *                notification_title: plastic
 *                notification_description: dangerous
 *                notification_for: 9cf446ed-04f8-41fe-ba40-1c33e5670ca5
 *                status: 'unread'
 *                creation_type: 'image'
 *                creation_link: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'
 *                notification_link: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Notification'
 *       "404":
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/NotificationNotFound'
 *             examples:
 *               NotificationNotFound:
 *                 summary: notification not found
 *                 value:
 *                   code: 404
 *                   message: notification not found
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete a notification by id
 *     description: Deletes a notification by its id
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotificationNotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
