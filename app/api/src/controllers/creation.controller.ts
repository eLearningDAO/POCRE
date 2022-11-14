import config from '../config/config';
import catchAsync from '../utils/catchAsync';
import * as creationService from '../services/creation.service';
import { IUserDoc } from '../services/user.service';
import { getTagById } from '../services/tag.service';
import { getMaterialById } from '../services/material.service';
import { generateProofOfCreation } from '../utils/generateProofOfCreation';

export const queryCreations = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.queryCreations(req.query as any);
  res.send(creation);
});

export const getCreationById = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.getCreationById(req.params.creation_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(creation);
});

export const getCreationProofById = catchAsync(async (req, res): Promise<void | any> => {
  const creation = await creationService.getCreationById(req.params.creation_id, {
    populate: [
      'author_id',
      'tags',
      'materials',
      'materials.type_id',
      'materials.author_id',
      'materials.recognition_id',
      'materials.recognition_id.recognition_by',
      'materials.recognition_id.recognition_for',
      'materials.recognition_id.status_id',
    ],
  });

  // proof object
  const creationProof = {
    ...creation,
    published_at: `${
      (config.creation_details_web_base_url as string).endsWith('/')
        ? config.creation_details_web_base_url.slice(0, -1)
        : config.creation_details_web_base_url
    }/${creation?.creation_id}`,
  };

  // when json is required
  if (req.query.format === 'json') return res.send(creationProof);

  // when document/web format is required
  if (req.query.format === 'web') {
    const document = await generateProofOfCreation(creationProof);
    return res.send(document);
  }
});

export const createCreation = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials) await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found

  const newCreation = await creationService.createCreation({ ...req.body, author_id: (req.user as IUserDoc).user_id });
  res.send(newCreation);
});

export const deleteCreationById = catchAsync(async (req, res): Promise<void> => {
  await creationService.deleteCreationById(req.params.creation_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateCreationById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.tags) await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials && req.body.materials.length > 0) {
    await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found
  }

  const creation = await creationService.updateCreationById(req.params.creation_id, req.body, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send(creation);
});
