import { useCallback, useState } from 'react';
import {
  Invitation, Material, Creation, Status,
} from 'api/requests';

const useDetails = () => {
  const [isFetchingRecognition, setIsFetchingRecognition] = useState(false);

  const [isAcceptingRecognition, setIsAcceptingRecognition] = useState(false);
  const [isDecliningRecognition, setIsDecliningRecognition] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [fetchRecognitionStatus, setFetchRecognitionStatus] = useState({
    success: false,
    error: null,
  });
  const [acceptRecognitionStatus, setAcceptRecognitionStatus] = useState({
    success: false,
    error: null,
  });
  const [declineRecognitionStatus, setDeclineRecognitionStatus] = useState({
    success: false,
    error: null,
  });

  const fetchRecognitionDetails = useCallback(async (id) => {
    try {
      setIsFetchingRecognition(true);

      // get recognition details
      const recognitionToPopulate = ['invite_from', 'invite_to', 'status_id'];
      const recognitionResponse = await Invitation.getById(id, recognitionToPopulate.map((x) => `populate=${x}`).join('&'));

      // get details of material for this invitation
      const materialToPopulate = ['source_id', 'type_id', 'author_id'];
      const materials = await Material.getAll(`limit=1&query=${recognitionResponse.invite_id}&search_fields[]=invite_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
      if (materials?.code >= 400) throw new Error('Failed to get invitation');
      const material = materials?.results?.[0] || null;

      // get details of creation of material
      const creationToPopulate = ['source_id', 'author_id', 'materials', 'tags', 'materials.source_id', 'materials.type_id', 'materials.author_id'];
      const creation = material ? await Creation.getAll(`limit=1&query=${material?.material_id}&search_fields[]=material_id&${creationToPopulate.map((x) => `populate=${x}`).join('&')}`) : null;
      if (material && !creation) throw new Error('Failed to get invitation');

      const transformedInvitation = {
        ...recognitionResponse,
        material,
        creation: creation ? creation?.results?.[0] : null,
      };

      setFetchRecognitionStatus({
        success: true,
        error: null,
      });
      setRecognition({ ...transformedInvitation });
      setTimeout(() => setFetchRecognitionStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchRecognitionStatus({
        success: false,
        error: 'Failed to fetch recognition details',
      });
    } finally {
      setIsFetchingRecognition(false);
    }
  }, []);

  // update a status linked to invitation
  const updateInvitationStatus = useCallback(
    async (
      statusId,
      statusBody = {},
    ) => await Status.update(statusId, statusBody),
    [],
  );

  // accepts an recogniton
  const acceptRecognition = useCallback(async () => {
    try {
      setIsAcceptingRecognition(true);

      // update recogniton status
      const temporaryRecognition = { ...recognition };
      const statusId = temporaryRecognition?.status?.status_id;
      const status = await updateInvitationStatus(statusId, { status_name: 'accepted' });
      temporaryRecognition.status = status;

      setAcceptRecognitionStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setAcceptRecognitionStatus({
        success: false,
        error: null,
      }), 3000);
      setRecognition({ ...temporaryRecognition });
    } catch {
      setAcceptRecognitionStatus({
        success: false,
        error: 'Failed to accept invite',
      });
    } finally {
      setIsAcceptingRecognition(false);
    }
  }, [recognition, setRecognition]);

  // rejects an invitation
  const declineRecognition = useCallback(async () => {
    try {
      setIsDecliningRecognition(true);

      // update invitation status
      const temporaryRecognition = { ...recognition };
      const statusId = temporaryRecognition.status.status_id;
      const status = await updateInvitationStatus(statusId, { status_name: 'declined' });
      temporaryRecognition.status = status;

      setDeclineRecognitionStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setDeclineRecognitionStatus({
        success: false,
        error: null,
      }), 3000);
      setRecognition({ ...temporaryRecognition });
    } catch {
      setDeclineRecognitionStatus({
        success: false,
        error: 'Failed to decline invite',
      });
    } finally {
      setIsDecliningRecognition(false);
    }
  }, [recognition, setRecognition]);

  return {
    isFetchingRecognition,
    fetchRecognitionStatus,
    recognition,
    fetchRecognitionDetails,
    isAcceptingRecognition,
    isDecliningRecognition,
    acceptRecognition,
    declineRecognition,
    acceptRecognitionStatus,
    declineRecognitionStatus,
    setAcceptRecognitionStatus,
    setDeclineRecognitionStatus,
  };
};

export default useDetails;
