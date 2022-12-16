import sgMailer from '@sendgrid/mail';
import httpStatus from 'http-status';
import config from '../config/config';
import ApiError from './ApiError';

sgMailer.setApiKey(config.sendgrid.api_key);

interface ISendMail {
  to: string;
  subject: string;
  message: string;
}

/**
 * Send an email
 * @param {string} sub
 * @returns {string}
 */
export const sendMail = async ({ to, subject, message }: ISendMail): Promise<string | void> => {
  try {
    await sgMailer.send({
      to,
      from: {
        name: config.sendgrid.from_name,
        email: config.sendgrid.from_email,
      },
      subject,
      text: message,
    });
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'email not sent');
  }
};
