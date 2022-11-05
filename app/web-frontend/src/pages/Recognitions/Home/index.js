import { Button, Grid } from '@mui/material';
import RecognitionCard from 'components/cards/RecognitionCard';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useEffect, useState } from 'react';
import useRecognition from '../common/hooks/useRecognitions';
import './index.css';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

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
        (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id,
      ).length === 0
        ? (
          <h3 className="m-auto p-64">Nothing here yet!</h3>
        )
        : recognitions?.results?.filter(
          (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id,
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
            (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id && (
            <RecognitionCard
              id={x.invite_id}
              title={x?.material?.material_title}
              mediaUrl={x?.material?.material_link}
              description={x?.material?.material_description}
              recognizedByUserName={x?.invite_from?.user_name}
              creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
              acceptedOn={x?.status?.status_name !== 'accepted' ? null : moment(x?.status?.action_made).format('Do MMMM YYYY')}
              declinedOn={x?.status?.status_name !== 'declined' ? null : moment(x?.status?.action_made).format('Do MMMM YYYY')}
              isPending={x?.status?.status_name === 'pending'}
              canAccept={x?.status?.status_name === 'pending'}
              canDecline={x?.status?.status_name === 'pending'}
            />
            ),
          )}
        </Grid>
        )) : null}

      {activeTab === 'co-creations-recognized' ? (recognitions?.results?.filter(
        (x) => x?.material && x?.invite_from?.user_id === authUser?.user_id,
      ).length === 0
        ? (
          <h3 className="m-auto p-64">Nothing here yet!</h3>
        )
        : recognitions?.results?.filter(
          (x) => x?.material && x?.invite_from?.user_id === authUser?.user_id,
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
                && x?.invite_from?.user_id === authUser?.user_id && (
                  <RecognitionCard
                    id={x.invite_id}
                    title={x?.material?.material_title}
                    mediaUrl={x?.material?.material_link}
                    description={x?.material?.material_description}
                    recognizedByUserName={null}
                    awaitingRecognitionByUserName={x?.invite_to?.user_name}
                    creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
                    isPending={x?.status?.status_name === 'pending'}
                    isAccepted={x?.status?.status_name === 'accepted'}
                    isDeclined={x?.status?.status_name === 'declined'}
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
