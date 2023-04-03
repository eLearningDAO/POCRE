import * as notificationService from '../services/notification.service';
import catchAsync from '../utils/catchAsync';

export const querynotifications = catchAsync(async (req, res): Promise<void> => {
  const creation = await notificationService.queryNotifications(req.query as any);
  res.send(creation);
});

export const getNotificationById = catchAsync(async (req, res): Promise<void> => {
  const notification = await notificationService.getNotificationById(req.params.notification_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(notification);
});

export const createNotification = catchAsync(async (req, res): Promise<void> => {
  const newNotification = await notificationService.createNotification({
    ...req.body,
  });

  res.send(newNotification);
});

export const deleteNotificationById = catchAsync(async (req, res): Promise<void> => {
  await notificationService.deleteNotificationById(req.params.notification_id);
  res.send();
});

export const updateNotificationById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.notification_id) await notificationService.getNotificationById(req.body.notification_id as string); // verify recognition, will throw an error if recognition not found

  const material = await notificationService.updateNotificationById(
    req.params.notification_id,
    {
      ...req.body,
    }
  );
  res.send(material);
});
