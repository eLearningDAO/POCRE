import catchAsync from '../utils/catchAsync';
import * as tagService from '../services/tag.service';

export const queryTags = catchAsync(async (req, res): Promise<void> => {
  const tags = await tagService.queryTags(req.query as any);
  res.send(tags);
});

export const getTagById = catchAsync(async (req, res): Promise<void> => {
  const tag = await tagService.getTagById(req.params.tag_id);
  res.send(tag);
});

export const createTag = catchAsync(async (req, res): Promise<void | any> => {
  // return if tag found
  const foundTag = await tagService.getTagByTagName(req.body.tag_name).catch(() => null);
  if (foundTag) return res.send(foundTag);

  // else create a new tag
  const newTag = await tagService.createTag(req.body);
  res.send(newTag);
});

export const deleteTagById = catchAsync(async (req, res): Promise<void> => {
  await tagService.deleteTagById(req.params.tag_id);
  res.send();
});

export const updateTagById = catchAsync(async (req, res): Promise<void> => {
  const tag = await tagService.updateTagById(req.params.tag_id, req.body);
  res.send(tag);
});
