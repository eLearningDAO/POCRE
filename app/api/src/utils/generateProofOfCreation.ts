import fs from 'fs';
import path from 'path';
import moment from 'moment';
import QRCode from 'qrcode';

const materialItemTemplate = fs.readFileSync(path.join(`${__dirname}/../templates/material-item.html`), 'utf8');
const materialsTemplate = fs.readFileSync(path.join(`${__dirname}/../templates/materials.html`), 'utf8');
const proofTemplate = fs.readFileSync(path.join(`${__dirname}/../templates/proof.html`), 'utf8');

/**
 * Populate a document with creation details
 * @param creation - an object containing creation details
 * @returns document in string format
 */
export const generateProofOfCreation = async (creation: any): Promise<string> => {
  // generate qr code
  const qrCodeConfig = { height: 250, width: 250, margin: 2, scale: 8 };
  const qrCode = await QRCode.toDataURL(creation?.published_at, {
    ...qrCodeConfig,
  });

  // fill materials template
  const materialItems =
    creation?.materials?.length > 0
      ? creation?.materials
          .map((x: any) => {
            let materialItemTemplateCopy = materialItemTemplate;
            materialItemTemplateCopy = materialItemTemplateCopy
              .replace('{{title}}', x?.material_title)
              .replace('{{type}}', x?.material_type)
              .replace('{{link}}', x?.material_link)
              .replace('{{link}}', x?.material_link)
              .replace('{{author}}', x?.author.user_name);
            return materialItemTemplateCopy;
          })
          .join('')
      : '';
  const materialsTemplateCopy = materialsTemplate;
  const materialsUsed = materialsTemplateCopy.replace('{{material_items}}', materialItems);

  // fill proof with creation details
  let proofOfCreation = proofTemplate;
  proofOfCreation = proofOfCreation
    .replace('{{creation_title}}', creation?.creation_title)
    .replace('{{creation_description}}', creation?.creation_description)
    .replace('{{creation_description}}', creation?.creation_description)
    .replace('{{creation_link}}', creation?.creation_link)
    .replace('{{creation_link}}', creation?.creation_link)
    .replace('{{creation_date}}', moment(creation?.creation_date).format('Do MMMM YYYY'))
    .replace('{{author.user_name}}', creation?.author.user_name)
    .replace('{{published_at}}', creation?.published_at)
    .replace('{{published_at}}', creation?.published_at)
    .replace('{{unique_id}}', creation?.creation_id)
    .replace('{{unique_id}}', creation?.creation_id)
    .replace('{{qr_code}}', qrCode)
    .replace('{{materials}}', materialsUsed);

  return proofOfCreation;
};
