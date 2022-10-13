import catchAsync from '../utils/catchAsync';
import * as sourceService from '../services/source.service';

export const getSourceById = catchAsync(async (req, res): Promise<void> => {
  const source = await sourceService.getSourceById(req.params.source_id);
  res.send(source);
});

export const createSource = catchAsync(async (req, res): Promise<void> => {
  const newSource = await sourceService.createSource(req.body);
  res.send(newSource);
});

export const deleteSourceById = catchAsync(async (req, res): Promise<void> => {
  await sourceService.deleteSoucreById(req.params.source_id);
  res.send();
});

export const updateSourceById = catchAsync(async (req, res): Promise<void> => {
  const source = await sourceService.updateSourceById(req.params.source_id, req.body);
  res.send(source);
});
