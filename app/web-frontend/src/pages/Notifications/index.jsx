import { Grid } from '@mui/material';
import NotificationsCard from 'components/cards/NotificationsCard';
import Loader from 'components/uicore/Loader';
import { useNavigate } from 'react-router-dom';
import './index.css';
import useHome from './useNotifications';

function Home() {
  const navigate = useNavigate();

  const {
    notificationList,
    isNotificationListFetched,
  } = useHome();
  const handleCreationCardClick = (creationId) => {
    navigate(creationId);
  };

  return (
    <div className="container">
      <Grid container spacing={12}>
        <Grid item md={12} xs={12} sm={12} className="trending-container">
          <h4 className="home-title">Notifications</h4>
          <div>
            {isNotificationListFetched ? <Loader /> : notificationList
              && notificationList.map((notification, index) => (
                <NotificationsCard
                  key={index}
                  creationType={notification?.creation_type}
                  mediaUrl={notification?.creation_link}
                  notification={notification}
                  handleCreationCardClick={handleCreationCardClick}
                />
              ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
