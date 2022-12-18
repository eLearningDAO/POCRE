import httpStatus from 'http-status';
import config from '../config/config';
import statusTypes from '../constants/statusTypes';
import * as creationService from '../services/creation.service';
import * as litigationService from '../services/litigation.service';
import { getMaterialById, updateMaterialById } from '../services/material.service';
import { createRecognition } from '../services/recognition.service';
import { getTagById } from '../services/tag.service';
import { IUserDoc } from '../services/user.service';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
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
      'materials.author_id',
      'materials.recognition_id',
      'materials.recognition_id.recognition_by',
      'materials.recognition_id.recognition_for',
    ],
  });

  // proof object
  const creationProof = {
    ...creation,
    published_at: `${(config.creation_details_web_base_url as string).endsWith('/')
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

  // make the creation
  const newCreation = await creationService.createCreation({ ...req.body, author_id: (req.user as IUserDoc).user_id });

  // send recognitions to material authors if the creation is published
  if (!req.body.is_draft && req.body.materials && req.body.materials.length > 0) {
    // get all materials
    // eslint-disable-next-line @typescript-eslint/return-await
    const materials = await Promise.all(req.body.materials.map(async (id: string) => await getMaterialById(id)));
    await Promise.all(
      materials.map(async (m: any) => {
        // send recognition
        const recognition = await createRecognition({
          recognition_for: m.author_id,
          recognition_by: (req.user as IUserDoc).user_id,
          status: 'pending',
          status_updated: new Date().toISOString(),
        });

        // update material with recognition
        await updateMaterialById(m.material_id, { recognition_id: recognition.recognition_id }, { owner_id: m.author_id });
      })
    );
  }

  res.send(newCreation);
});

export const deleteCreationById = catchAsync(async (req, res): Promise<void> => {
  // get the creation
  const foundCreation = await creationService.getCreationById(req.params.creation_id, {
    populate: ['materials.recognition_id'],
  });

  // check if the creation has ongoing material recognition process
  if (
    !foundCreation?.is_draft &&
    foundCreation?.materials &&
    foundCreation.materials.length > 0 &&
    foundCreation.materials.filter((x: any) => x?.recognition?.status === statusTypes.PENDING).length > 0
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `creation has ongoing material recognition process`);
  }

  // check if the creation has ongoing litigation process
  const foundLitigation = await litigationService
    .getLitigationByCriteria('creation_id', req.params.creation_id)
    .catch(() => null);
  if (foundLitigation && !foundLitigation.ownership_transferred) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `creation has ongoing litigation process`);
  }

  // delete the creation
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

  // get original creation
  const foundCreation = await creationService.getCreationById(req.params.creation_id);

  // block update if creation is published
  if (!foundCreation?.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `published creation cannot be updated`);
  }

  // update creation
  const updatedCreation = await creationService.updateCreationById(req.params.creation_id, req.body, {
    owner_id: (req.user as IUserDoc).user_id,
  });

  // send recognitions to material authors if the creation is published
  if (foundCreation?.is_draft && req.body.is_draft === false && updatedCreation && updatedCreation.materials.length > 0) {
    // get all materials
    // eslint-disable-next-line @typescript-eslint/return-await
    const materials = await Promise.all(updatedCreation.materials.map(async (id: string) => await getMaterialById(id)));

    await Promise.all(
      materials.map(async (m: any) => {
        // send recognition
        const recognition = await createRecognition({
          recognition_for: m.author_id,
          recognition_by: (req.user as IUserDoc).user_id,
          status: 'pending',
          status_updated: new Date().toISOString(),
        });

        // update material with recognition
        await updateMaterialById(m.material_id, {
          recognition_id: recognition.recognition_id,
        });
      })
    );
  }

  res.send(updatedCreation);
});

export const getCreationLinkFileType = catchAsync(async (req, res): Promise<void> => {
  const url = req.body.creation_link;
  const stream = got.stream(url);
  const fileType = await FileType.fromStream(stream);
  logger.info(fileType);
  const result = { ...fileType, mime: fileType?.mime.split('/')[0] };
  res.send(result);
});
