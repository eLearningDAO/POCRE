import { useQuery } from '@tanstack/react-query';
import { Notifications } from 'api/requests';
import authUser from 'utils/helpers/authUser';

const useHome = () => {
  const auth = authUser.getUser();
  const user = auth?.user_id;
  const queryKey = `notifications-${user}`;
  const {
    data: notificationList,
    isLoading: isNotificationListFetched,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      let createResponse = Notifications.getAll(
        `page=${1}&limit=5&descend_fields[]=created_at&query=${user}&search_fields[]=notification_for`,
      );
      createResponse = await createResponse;
      return createResponse.results;
    },
    staleTime: 60_000, // cache for 60 seconds
  });
  return {
    notificationList,
    isNotificationListFetched,
  };
};
export default useHome;
