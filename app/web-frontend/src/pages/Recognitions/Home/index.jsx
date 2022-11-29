import { Button, Grid } from '@mui/material';
import RecognitionCard from 'components/cards/RecognitionCard';
import moment from 'moment';
import { useEffect, useState } from 'react';
import authUser from 'utils/helpers/authUser';
import useRecognition from '../common/hooks/useRecognitions';
import './index.css';

const user = authUser.getUser();

function Recognition() {
  const [activeTab, setActiveTab] = useState('co-author-recognition');

  const {
    isFetchingRecognitions,
    fetchRecognitions,
    recognitions,
  } = useRecognition();

  useEffect(() => {
    fetchRecognitions();
  }, []);

  if (isFetchingRecognitions) return <div style={{ margin: 'auto' }} className="loader" />;
  if (recognitions?.results?.length === 0) {
    return (
      <h4 className="heading h4 result-msg">
        No Recognitions Found
      </h4>
    );
  }

  return (
    <Grid container spacing={2}>

      <div className="toggle-bar2">
        <Button
          className={`btn ${activeTab === 'co-author-recognition' && 'btn-active'}`}
          onClick={() => setActiveTab('co-author-recognition')}
        >
          My Co-author Recognitions
        </Button>
        <Button
          className={`btn ${activeTab === 'co-creations-recognized' && 'btn-active'}`}
          onClick={() => setActiveTab('co-creations-recognized')}
        >
          Co-creations Recognized by me
        </Button>
      </div>

      {activeTab === 'co-author-recognition' ? (recognitions?.results?.filter(
        (x) => x?.material && x?.recognition_for?.user_id === user?.user_id,
      ).length === 0
        ? (
          <h3 className="m-auto p-64">Nothing here yet!</h3>
        )
        : recognitions?.results?.filter(
          (x) => x?.material && x?.recognition_for?.user_id === user?.user_id,
        ).length > 0 && (
        <Grid
          width="100%"
          display="flex"
          flexDirection={{ xs: 'row', md: 'column' }}
          overflow={{ xs: 'scroll', md: 'initial' }}
          bgcolor="transparent"
          gap={{ xs: '16px' }}
          className="hidden-scrollbar"
          padding={{ xs: '12px', md: '0' }}
        >
          {recognitions?.results?.map(
            (x) => x?.material && x?.recognition_for?.user_id === user?.user_id && (
            <RecognitionCard
              id={x.recognition_id}
              title={x?.material?.material_title}
              mediaUrl={x?.material?.material_link}
              description={x?.material?.material_description}
              recognizedByUserName={x?.recognition_by?.user_name}
              // eslint-disable-next-line unicorn/prefer-module
              userImage={x?.recognition_by?.image_url || require('assets/images/profile-placeholder.png')}
              userProfileId={x?.recognition_by?.user_id}
              creationDate={moment(x?.recognition_issued).format('Do MMMM YYYY')}
              acceptedOn={x?.status !== 'accepted' ? null : moment(x?.status_updated).format('Do MMMM YYYY')}
              declinedOn={x?.status !== 'declined' ? null : moment(x?.status_updated).format('Do MMMM YYYY')}
              isPending={x?.status === 'pending'}
              canAccept={x?.status === 'pending'}
              canDecline={x?.status === 'pending'}
            />
            ),
          )}
        </Grid>
        )) : null}

      {activeTab === 'co-creations-recognized' ? (recognitions?.results?.filter(
        (x) => x?.material && x?.recognition_by?.user_id === user?.user_id,
      ).length === 0
        ? (
          <h3 className="m-auto p-64">Nothing here yet!</h3>
        )
        : recognitions?.results?.filter(
          (x) => x?.material && x?.recognition_by?.user_id === user?.user_id,
        ).length > 0 && (
        <Grid
          width="100%"
          display="flex"
          flexDirection={{ xs: 'row', md: 'column' }}
          overflow={{ xs: 'scroll', md: 'initial' }}
          bgcolor="transparent"
          gap={{ xs: '16px' }}
          className="hidden-scrollbar"
          padding={{ xs: '12px', md: '0' }}
        >
          {recognitions?.results?.map((x) => x?.material
                && x?.recognition_by?.user_id === user?.user_id && (
                  <RecognitionCard
                    id={x.recognition_id}
                    title={x?.material?.material_title}
                    mediaUrl={x?.material?.material_link}
                    description={x?.material?.material_description}
                    recognizedByUserName={null}
                    awaitingRecognitionByUserName={x?.recognition_for?.user_name}
                    creationDate={moment(x?.recognition_issued).format('Do MMMM YYYY')}
                    // eslint-disable-next-line unicorn/prefer-module
                    userImage={x?.recognition_for?.image_url || require('assets/images/profile-placeholder.png')}
                    userProfileId={x?.recognition_for?.user_id}
                    isPending={x?.status === 'pending'}
                    isAccepted={x?.status === 'accepted'}
                    isDeclined={x?.status === 'declined'}
                    canAccept={false}
                    canDecline={false}
                  />
          ))}
        </Grid>
        ))
        : null}
    </Grid>
  );
}

export default Recognition;
