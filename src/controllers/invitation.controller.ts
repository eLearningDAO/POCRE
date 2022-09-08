import catchAsync from '../utils/catchAsync';
import * as invitationService from '../services/invitation.service';
import { getUserById } from '../services/user.service';
import { getStatusById } from '../services/status.service';

export const getInvitationById = catchAsync(async (req, res): Promise<void> => {
  const invitation = await invitationService.getInvitationById(req.params.invite_id);
  res.send(invitation);
});

export const createInvitation = catchAsync(async (req, res): Promise<void> => {
  await getUserById(req.body.invite_from); // verify user, will throw an error if user not found
  await getUserById(req.body.invite_to); // verify user, will throw an error if user not found
  await getStatusById(req.body.status_id); // verify status, will throw an error if status not found

  const newInvitation = await invitationService.createInvitation(req.body);
  res.send(newInvitation);
});

export const deleteInvitationById = catchAsync(async (req, res): Promise<void> => {
  await invitationService.deleteInvitationById(req.params.invite_id);
  res.send();
});

export const updateInvitationById = catchAsync(async (req, res): Promise<void> => {
  if (req.body.invite_from) await getUserById(req.body.invite_from); // verify user, will throw an error if user not found
  if (req.body.invite_to) await getUserById(req.body.invite_to); // verify user, will throw an error if user not found
  if (req.body.status_id) await getStatusById(req.body.status_id); // verify status, will throw an error if status not found

  const invitation = await invitationService.updateInvitationById(req.params.invite_id, req.body);
  res.send(invitation);
});
