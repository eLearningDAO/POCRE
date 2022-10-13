import catchAsync from '../utils/catchAsync';
import * as materialTypeService from '../services/materialType.service';

export const getMaterialTypeById = catchAsync(async (req, res): Promise<void> => {
  const materialType = await materialTypeService.getMaterialTypeById(req.params.type_id);
  res.send(materialType);
});

export const createMaterialType = catchAsync(async (req, res): Promise<void> => {
  const newMaterialType = await materialTypeService.createMaterialType(req.body);
  res.send(newMaterialType);
});

export const deleteMaterialTypeById = catchAsync(async (req, res): Promise<void> => {
  await materialTypeService.deleteMaterialTypeById(req.params.type_id);
  res.send();
});

export const updateMaterialTypeById = catchAsync(async (req, res): Promise<void> => {
  const materialType = await materialTypeService.updateMaterialTypeById(req.params.type_id, req.body);
  res.send(materialType);
});
