import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import notificationStatusTypes from '../constants/notificationStatusTypes';
import supportedMediaTypes from '../constants/supportedMediaTypes';

const types = Object.values(notificationStatusTypes);
type TNotificationStatus = typeof types[number];

const creationTypes = Object.values(supportedMediaTypes);
type TNotificationCreationTypes = typeof creationTypes[number];

interface INotification {
  notification_for: string;
  notification_title: string;
  notification_description: string;
  creation_type: TNotificationCreationTypes;
  creation_link: string;
  notification_link: string;
  status: TNotificationStatus;
}
interface INotificationQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
  ascend_fields: string[];
  descend_fields: string[];
  notification_for: string;
  notification_title: string;
  notification_description: string;
  status: TNotificationStatus;
  populate?: string | string[];
}
interface INotificationQueryResult {
  results: Array<INotificationDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface INotificationDoc {
  notification_id: string;
  notification_for: string;
  notification_title: string;
  notification_description: string;
  status: TNotificationStatus;
  creation_type: TNotificationCreationTypes;
  creation_link: string;
  notification_link: string;
  ascend_fields: string[];
  descend_fields: string[];
}

/**
 * Create a notification
 * @param {INotification} notificationBody
 * @returns {Promise<INotificationDoc>}
 */
export const createNotification = async (notificationBody: INotification): Promise<INotificationDoc> => {
  try {
    const result = await db.instance.query(
      `INSERT INTO notification (
        notification_for,
        notification_title,
        notification_description,
        status,
        creation_type,
        creation_link,
        notification_link
      ) 
      values 
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      ) 
      RETURNING *;`,
      [
        notificationBody.notification_for,
        notificationBody.notification_title,
        notificationBody.notification_description,
        notificationBody.status,
        notificationBody.creation_type,
        notificationBody.creation_link,
        notificationBody.notification_link,
      ]
    );
    const notification = result.rows[0];
    return notification;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for notifications
 * @returns {Promise<Array<INotification>>}
 */
export const queryNotifications = async (options: INotificationQuery): Promise<INotificationQueryResult> => {
  try {
    // search
    const {search_fields,query,ascend_fields,descend_fields,status,limit,page} = options
    const search =
      search_fields && search_fields.length > 0
        ? `WHERE ${search_fields
            .map(
              (field) =>
                `${field} ${['notification_for'].includes(field) ? `= '${query}'` : `LIKE '%${query}%'`}`
            )
            .join(' OR ')}`
        : '';

      const ascendOrder =
        (ascend_fields || []).length > 0 ? `${ascend_fields.map((x) => `${x} ASC`).join(', ')}` : '';
      const descendOrder =
        (descend_fields || []).length > 0 ? `${descend_fields.map((x) => `${x} DESC`).join(', ')}` : '';
      const order =
        (ascend_fields || descend_fields || []).length > 0
          ? `ORDER BY ${ascendOrder} ${
              (ascend_fields || []).length > 0 && (descend_fields || []).length > 0 ? ', ' : ''
            } ${descendOrder}`
          : '';

    // list of queries
    const queryModes = {
      default: {
        query: `SELECT * FROM notification n ${search} ${order} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM notification ${search};`,
      },
      notificationsByStatus: {
        query: `SELECT * FROM notification n ${search} and n.status='${status}' ${order} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM notification n ${search} and n.status='${status}';`,
      },
    };
    const result = await db.instance.query(
      typeof status === 'string' ?
      queryModes.notificationsByStatus.query
        : queryModes.default.query,
      [page === 1 ? '0' : (page - 1) * limit, limit]
    );
    const notifications = result.rows;

    const count = await (
      await db.instance.query(
        typeof status === 'string' ?
        queryModes.notificationsByStatus.count
          : queryModes.default.count,
        []
      )
    ).rows[0];

    return {
      results: notifications,
      limit: options.limit,
      page: options.page,
      total_results: count.total_results,
      total_pages: Math.ceil(count.total_results / options.limit),
    };
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Get a notification by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the notification that belongs to notification_for
 * @returns {Promise<INotificationDoc|null>}
 */
export const getNotificationById = async (
  id: string,
  options?: {
    populate?: string | string[];
    notification_for?: string;
  }
): Promise<INotificationDoc | null> => {
  const notification = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT 
        *
        FROM 
        notification n 
        WHERE 
        notification_id = $1
        ${options && options.notification_for ? 'AND notification_for = $2' : ''}
        ;`,
        [id, options && options.notification_for ? options.notification_for : false].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'notification not found');

  return notification;
};

/**
 * Update notification by id
 * @param {string} id
 * @param {Partial<INotification>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the notification that belongs to notification_for
 * @returns {Promise<INotificationDoc|null>}
 */
export const updateNotificationById = async (
  id: string,
  updateBody: Partial<INotification>,
  options?: { owner_id?: string }
): Promise<INotificationDoc | null> => {
  // check if notification exists, throws error if not found
  await getNotificationById(id);

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null | boolean)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update notification
  try {
    const updateQry = await db.instance.query(
      `
      UPDATE notification SET
      ${conditions.filter(Boolean).join(',')}
      WHERE notification_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const notification = updateQry.rows[0];
    return notification;
  } catch (e: unknown) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Update notification in bulk
 * @param {string} field - the field to match and update
 * @param {string} existingValue - the present value of field
 * @param {string} updatedValue - the new value of field
 * @returns {Promise<INotificationDoc|null>}
 */
export const updateNotificationsInBulk = async (
  field: 'status',
  existingValue: string,
  updatedValue: string
): Promise<INotificationDoc[] | null> => {
  try {
    const updateQry = await db.instance.query(`UPDATE notification SET ${field} = $1 WHERE ${field} = $2 RETURNING *;`, [
      updatedValue,
      existingValue,
    ]);
    const notifications = updateQry.rows;
    return notifications;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete notification by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.notification_for - deletes the notification that belongs to notification_for
 * @returns {Promise<INotificationDoc|null>}
 */
export const deleteNotificationById = async (id: string, options?: { notification_for?: string }): Promise<INotificationDoc | null> => {
  // check if notification exists, throws error if not found
  const notification = await getNotificationById(id);

  try {
    await db.instance.query(`DELETE FROM notification WHERE notification_id = $1;`, [id]);
    return notification;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
