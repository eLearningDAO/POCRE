import catchAsync from '../utils/catchAsync';
import * as statusService from '../services/status.service';

export const getStatusById = catchAsync(async (req, res): Promise<void> => {
  const status = await statusService.getStatusById(req.params.status_id);
  res.send(status);
});

export const createStatus = catchAsync(async (req, res): Promise<void> => {
  const newStatus = await statusService.createStatus(req.body);
  res.send(newStatus);
});

export const deleteStatusById = catchAsync(async (req, res): Promise<void> => {
  await statusService.deleteStatusById(req.params.status_id);
  res.send();
});

export const updateStatusById = catchAsync(async (req, res): Promise<void> => {
  const status = await statusService.updateStatusById(req.params.status_id, req.body);
  res.send(status);
});
