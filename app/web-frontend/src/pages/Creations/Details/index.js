/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Chip, Grid,
  Typography, Box, Button,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import MaterialCard from 'components/cards/MaterialCard';
import Loader from 'components/uicore/Loader';
import './index.css';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import DownloadIconSVG from 'assets/svgs/download.svg';
import useDetails from './useDetails';

export default function CreationDetails() {
  const { id } = useParams();

  const [mediaType, setMediaType] = useState(null);
  const [qrcodeBase64, setQrcodeBase64] = useState(null);

  const {
    creation,
    fetchCreationDetails,
    fetchCreationStatus,
    isFetchingCreation,
  } = useDetails();

  const generateQRCodeBase64 = async (text) => {
    const code = await QRCode.toDataURL(`${window.location.origin}/creations/${text}`, {
      width: 150,
      height: 150,
      margin: 2,
      scale: 8,
    });

    setQrcodeBase64(code);
  };

  useEffect(() => {
    if (id) fetchCreationDetails(id);
  }, [id]);

  useEffect(() => {
    const x = getUrlFileType(creation?.creation_link);
    setMediaType(x);
    if (creation?.creation_id) generateQRCodeBase64(creation?.creation_id);
  }, [creation]);

  if (isFetchingCreation) return <Loader />;

  if (fetchCreationStatus.error) {
    return (
      <h2 className="color-red">
        {fetchCreationStatus.error}
      </h2>
    );
  }

  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography className="litigationCloseTitle" variant="h6">
          Creation -
          {' '}
          {creation?.creation_title}
        </Typography>
      </Grid>

      <Grid
        display="flex"
        flexDirection="column"
        gap="12px"
        alignItem="flex-top"
        marginTop="18px"
        width="100%"
      >
        <div
          className="creation-media"
        >
          {mediaType === 'image' && (
            <img alt="collection-card-hero" src={creation?.creation_link} />
          )}
          {mediaType === 'video' && (
            <video
              src={creation?.creation_link}
              preload="metadata"
              controls
            />
          )}
          {mediaType === 'audio' && (
            <audio src={creation?.creation_link} controls />
          )}
          {(mediaType === 'document' && creation?.creation_link?.includes('.pdf')) && (
            <embed src={creation?.creation_link} />
          )}
          {mediaType === 'document' && !creation?.creation_link?.includes('.pdf') && (
            <div className="unsupported-file-type">
              <h4 className="heading h4">Are you okay to download this file?</h4>
              <a href={mediaType}>{creation?.creation_link}</a>
              <div className="media-preview-content-options">
                <Button
                  className="btn btn-primary icon-btn"
                  // eslint-disable-next-line security/detect-non-literal-fs-filename
                  onClick={() => window.open(creation?.creation_link)}
                >
                  <img src={DownloadIconSVG} alt="" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </Grid>

      <Grid
        display="flex"
        gap="12px"
        alignItem="flex-top"
        marginTop="18px"
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="column"
          gap="12px"
          width="100%"
          className="creation-author"
        >
          <Box
            display="flex"
            gap="12px"
            alignItem="center"
            justifyContent="space-between"
            width="100%"
            className="creation-author"
          >
            <img
              className="creation-user-image"
              src={`https://i.pravatar.cc/150?img=${Math.random()}`}
              alt=""
            />
            <Box
              display="flex"
              flexDirection="column"
              gap="5px"
              alignItem="center"
              width="fit-content"
              marginLeft="0"
              marginRight="auto"
            >
              <h4 className="h4">
                {creation?.author?.user_name}
              </h4>
              <Chip className="mr-auto bg-orange-dark color-white" label={`Created on ${moment(creation?.creation_date).format('DD/MM/YYYY')}`} />
              <Chip className="mr-auto bg-black color-white" label={`Unique ID: ${creation?.creation_id}`} />
            </Box>
          </Box>
          {creation?.creation_description && (
            <Typography variant="p">
              {creation?.creation_description}
            </Typography>
          )}
        </Box>
        <img className="creation-qr-code" src={qrcodeBase64} alt="QR Code" />
      </Grid>

      {creation?.materials?.length > 0 && (
        <>

          <Grid item xs={12} marginTop="24px">
            <Typography className="litigationCloseTitle" variant="h4">
              Materials Used (
              {creation?.materials?.length}
              )
            </Typography>
          </Grid>

          <Grid display="flex" flexDirection="column" gap="12px" marginTop="12px" width="100%">
            {creation?.materials?.map((x, index) => (
              <MaterialCard
                key={index}
                mediaUrl={x?.material_link}
                link={x?.material_link}
                title={x?.material_title}
                description={x?.material_description}
                username={x?.author?.user_name}
                interactionBtns={false}
                showReconcilateOptions={false}
                recognitionStatus={x?.recognition?.status || null}
              />
            ))}
          </Grid>
        </>
      )}

      <Grid item xs={12} marginTop="48px" width="100%">
        <h2 className="header-lines"><span>Tags</span></h2>
      </Grid>

      <Grid
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="12px"
        marginTop="12px"
        width="100%"
      >
        {creation?.tags?.map((x, index) => (
          <Chip className="bg-orange-dark color-white w-fit" style={{ paddingLeft: '8px', paddingRight: '8px' }} key={index} label={x?.tag_name} />
        ))}
      </Grid>
    </Grid>
  );
}
