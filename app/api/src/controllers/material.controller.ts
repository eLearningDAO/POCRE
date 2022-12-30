import config from '../config/config';
import * as materialService from '../services/material.service';
import { getRecognitionById } from '../services/recognition.service';
import { getUserById, IUserDoc } from '../services/user.service';
import catchAsync from '../utils/catchAsync';
import { sendMail } from '../utils/email';
import { encode } from '../utils/jwt';
import { getSupportedFileTypeFromLink } from '../utils/getSupportedFileTypeFromLink';

export const queryMaterials = catchAsync(async (req, res): Promise<void> => {
  const creation = await materialService.queryMaterials(req.query as any);
  res.send(creation);
});

export const getMaterialById = catchAsync(async (req, res): Promise<void> => {
  const material = await materialService.getMaterialById(req.params.material_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(material);
});

export const createMaterial = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  let foundUser = null;
  if (req.body.recognition_id) await getRecognitionById(req.body.recognition_id as string); // verify recognition, will throw an error if recognition not found
  if (req.body.author_id && req.body.author_id !== (req.user as IUserDoc).user_id) {
    foundUser = await getUserById(req.body.author_id as string); // verify author id (if present), will throw an error if not found
  }

  // get the material type from link
  const materialType = await getSupportedFileTypeFromLink(req.body.material_link);

  // create material
  const newMaterial = await materialService.createMaterial({
    ...req.body,
    material_type: materialType,
    author_id: req.body.author_id || (req.user as IUserDoc).user_id,
  });

  // send email to the invited user if found
  if (foundUser && foundUser.is_invited && foundUser.email_address) {
    await sendMail({
      to: foundUser.email_address as string,
      subject: `Invitation to recognize authorship of "${newMaterial.material_title}"`,
      message: `You were recognized as author of "${newMaterial.material_title}" by ${
        (req.user as IUserDoc)?.user_name
      }. Please signup on ${config.web_client_base_url}/signup?token=${encode(
        foundUser.user_id
      )} to be recognized as the author.`,
    }).catch(() => null);
  }

  res.send(newMaterial);
});

export const deleteMaterialById = catchAsync(async (req, res): Promise<void> => {
  await materialService.deleteMaterialById(req.params.material_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateMaterialById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.recognition_id) await getRecognitionById(req.body.recognition_id as string); // verify recognition, will throw an error if recognition not found

  // get the material type from link
  const materialType = req.body.material_link ? await getSupportedFileTypeFromLink(req.body.material_link) : null;

  // update creation
  const material = await materialService.updateMaterialById(
    req.params.material_id,
    {
      ...req.body,
      ...(materialType && { material_type: materialType }),
    },
    {
      owner_id: (req.user as IUserDoc).user_id,
    }
  );
  res.send(material);
});
