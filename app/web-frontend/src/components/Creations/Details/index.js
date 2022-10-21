/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Chip, Grid,
  Typography, Box, Button,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MaterialCard from '../../cards/MaterialCard';
import Loader from '../../uicore/Loader';
import './index.css';
import useDetails from './useDetails';
import { getUrlFileType } from '../../../utils/helpers/getUrlFileType';
import DownloadIconSVG from '../../../assets/svgs/download.svg';

export default function CreationDetails() {
  const { id } = useParams();

  const [mediaType, setMediaType] = useState(null);

  const {
    creation,
    fetchCreationDetails,
    fetchCreationStatus,
    isFetchingCreation,
  } = useDetails();

  useEffect(() => {
    if (id) fetchCreationDetails(id);
  }, [id]);

  useEffect(() => {
    const x = getUrlFileType(creation?.source?.site_url);
    setMediaType(x);
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
            <img alt="collection-card-hero" src={creation?.source?.site_url} />
          )}
          {mediaType === 'video' && (
            <video
              src={creation?.source?.site_url}
              preload="metadata"
              controls
            />
          )}
          {mediaType === 'audio' && (
            <audio src={creation?.source?.site_url} controls />
          )}
          {(mediaType === 'document' && creation?.source?.site_url?.includes('.pdf')) && (
            <embed src={creation?.source?.site_url} />
          )}
          {mediaType === 'document' && !creation?.source?.site_url?.includes('.pdf') && (
          <div className="unsupported-file-type">
            <h4 className="heading h4">Are you okay to download this file?</h4>
            <a href={mediaType}>{creation?.source?.site_url}</a>
            <div className="media-preview-content-options">
              <Button
                className="btn btn-primary icon-btn"
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                onClick={() => window.open(creation?.source?.site_url)}
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
          gap="12px"
          alignItem="center"
          justifyContent="center"
          width="100%"
          className="creation-author"
        >
          <img src={`https://i.pravatar.cc/100?img=${Math.random()}`} alt="" />
          <Box
            display="flex"
            flexDirection="column"
            gap="5px"
            alignItem="center"
            width="100%"
          >
            <Typography className="inviationSectionTitle" variant="h6">
              {creation?.author?.user_name}
            </Typography>
            {/* <Typography className="creation-author-wallet" variant="p">
              {creation?.author?.wallet_address?.slice(0, 48)}
            </Typography> */}
          </Box>
        </Box>
        <Chip className="mr-auto bg-orange color-white" label={`Created on ${moment(creation?.creation_date).format('DD/MM/YYYY')}`} />
      </Grid>

      <Grid
        display="flex"
        flexDirection="column"
        gap="12px"
        alignItem="flex-top"
        marginTop="18px"
        width="100%"
      >
        {creation?.creation_description && (
        <Typography variant="p">
          {creation?.creation_description}
        </Typography>
        )}
      </Grid>

      {creation?.materials.length > 0 && (
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
                recognitionStatus={x?.invite?.status?.status_name || null}
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
          <Chip className="bg-orange color-white w-fit" style={{ paddingLeft: '8px', paddingRight: '8px' }} key={index} label={x?.tag_name} />
        ))}
      </Grid>
    </Grid>
  );
}
