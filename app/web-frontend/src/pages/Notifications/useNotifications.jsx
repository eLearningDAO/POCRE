import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notifications } from 'api/requests';
import authUser from 'utils/helpers/authUser';

const useNotifications = () => {
  const queryClient = useQueryClient();
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
  // update creation
  const {
    mutate: updateNotification,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,
    isLoading: isUpdatingNotification,
  } = useMutation({
    mutationFn: async (notificationId) => {
      // updated creation body
      const updatedNotification = {
        status: 'read',
      };
      await Notifications.update(notificationId, { ...updatedNotification });
      // remove queries cache
      queryClient.invalidateQueries({ queryKey: [`notifications-${user}`] });
      queryClient.invalidateQueries({ queryKey: [`notifications-count-${user}`] });
    },
  });

  return {
    updateNotification,
    isUpdatingNotification,
    notificationList,
    isNotificationListFetched,
    updateNotificationStatus: {
      success: isUpdateSuccess,
      error: isUpdateError ? 'Failed to update creation' : null,
    },
  };
};
export default useNotifications;
