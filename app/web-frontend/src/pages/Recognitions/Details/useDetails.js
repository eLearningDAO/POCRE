import { useCallback, useState } from 'react';
import { API_BASE_URL } from 'config';

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
      const recognitionResponse = await fetch(`${API_BASE_URL}/invitations/${id}`).then((x) => x.json());
      if (recognitionResponse.code >= 400) throw new Error('Failed to get invitation');

      // get details of inviteFrom user
      const inviteFromUser = await fetch(`${API_BASE_URL}/users/${recognitionResponse.invite_from}`).then((x) => x.json());
      if (inviteFromUser?.code >= 400) throw new Error('Failed to get invitation');

      // get details of inviteTo user
      const inviteToUser = await fetch(`${API_BASE_URL}/users/${recognitionResponse.invite_to}`).then((x) => x.json());
      if (inviteToUser?.code >= 400) throw new Error('Failed to get invitation');

      // get details of invitation status
      const status = await fetch(`${API_BASE_URL}/status/${recognitionResponse.status_id}`).then((x) => x.json());
      if (status?.code >= 400) throw new Error('Failed to get invitation');

      // get details of material for this invitation
      const material = await (async () => {
        const materials = await fetch(`${API_BASE_URL}/materials?query=${recognitionResponse.invite_id}&search_fields[]=invite_id`).then((x) => x.json());
        if (materials?.code >= 400) throw new Error('Failed to get invitation');
        const temporaryMaterial = materials?.results?.[0] || null;
        if (!temporaryMaterial) return null;

        // get details of material author
        const materialAuthor = await fetch(`${API_BASE_URL}/users/${temporaryMaterial.author_id}`).then((x) => x.json());
        if (materialAuthor?.code >= 400) throw new Error('Failed to get invitation');

        // get details of material source
        const materialSource = await fetch(`${API_BASE_URL}/source/${temporaryMaterial.source_id}`).then((x) => x.json());
        if (materialSource?.code >= 400) throw new Error('Failed to get invitation');

        // get details of material type
        const materialType = await fetch(`${API_BASE_URL}/material-type/${temporaryMaterial.type_id}`).then((x) => x.json());
        if (materialType?.code >= 400) throw new Error('Failed to get invitation');

        // update temporary material
        delete temporaryMaterial.author_id;
        delete temporaryMaterial.source_id;
        delete temporaryMaterial.type_id;
        temporaryMaterial.author = materialAuthor;
        temporaryMaterial.source = materialSource;
        temporaryMaterial.type = materialType;

        return temporaryMaterial;
      })();

      // get details of creation of material
      const creation = await (async () => {
        if (!material) return null;

        const creationResponse = await fetch(`${API_BASE_URL}/creations?query=${material?.material_id}&search_fields[]=material_id`).then((x) => x.json());
        if (creationResponse?.code >= 400) throw new Error('Failed to get invitation');
        const temporaryCreation = creationResponse?.results?.[0] || null;
        if (!temporaryCreation) return null;

        // get details of creation author
        const creationAuthor = await fetch(`${API_BASE_URL}/users/${temporaryCreation.author_id}`).then((x) => x.json());
        if (creationAuthor?.code >= 400) throw new Error('Failed to get invitation');

        // get details of creation source
        const creationSource = await fetch(`${API_BASE_URL}/source/${temporaryCreation.source_id}`).then((x) => x.json());
        if (creationSource?.code >= 400) throw new Error('Failed to get invitation');

        // get details of creation materials
        const materials = await Promise.all(
          temporaryCreation.materials.map(async (materialId) => {
            const materialsResponse = await fetch(`${API_BASE_URL}/materials/${materialId}`).then((x) => x.json());
            if (materialsResponse?.code >= 400) throw new Error('Failed to get invitation');
            const temporaryMaterial = materialsResponse || null;
            if (!temporaryMaterial) return null;

            // get details of material author
            const materialAuthor = await fetch(`${API_BASE_URL}/users/${temporaryMaterial.author_id}`).then((x) => x.json());
            if (materialAuthor?.code >= 400) throw new Error('Failed to get invitation');

            // get details of material source
            const materialSource = await fetch(`${API_BASE_URL}/source/${temporaryMaterial.source_id}`).then((x) => x.json());
            if (materialSource?.code >= 400) throw new Error('Failed to get invitation');

            // get details of material type
            const materialType = await fetch(`${API_BASE_URL}/material-type/${temporaryMaterial.type_id}`).then((x) => x.json());
            if (materialType?.code >= 400) throw new Error('Failed to get invitation');

            // update temporary material
            delete temporaryMaterial.author_id;
            delete temporaryMaterial.source_id;
            delete temporaryMaterial.type_id;
            temporaryMaterial.author = materialAuthor;
            temporaryMaterial.source = materialSource;
            temporaryMaterial.type = materialType;

            return temporaryMaterial;
          }),
        );

        // get details of creation tags
        // eslint-disable-next-line no-return-await
        const tags = await Promise.all(temporaryCreation.tags.map(async (tagId) => await fetch(`${API_BASE_URL}/tags/${tagId}`).then((x) => x.json())));

        // update temporary creation
        delete temporaryCreation.author_id;
        delete temporaryCreation.source_id;
        temporaryCreation.author = creationAuthor;
        temporaryCreation.source = creationSource;
        temporaryCreation.materials = materials;
        temporaryCreation.tags = tags;

        return temporaryCreation;
      })();

      const transformedInvitation = {
        ...recognitionResponse,
        invite_from: inviteFromUser,
        invite_to: inviteToUser,
        status,
        material,
        creation,
      };

      delete transformedInvitation.status_id;

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
  const updateInvitationStatus = useCallback(async (statusId, statusBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/status/${statusId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to update status');
    return response;
  }, []);

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
