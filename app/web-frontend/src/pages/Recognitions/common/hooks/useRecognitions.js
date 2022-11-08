import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Invitation, Material, Status, Creation,
} from 'api/requests';
import Cookies from 'js-cookie';
import { useState } from 'react';

// get auth user
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useRecognitions = () => {
  const queryClient = useQueryClient();

  const [shouldFetchRecognitions, setShouldFetchRecognitions] = useState(false);
  const [recognitionId, setRecognitionId] = useState(null);

  // fetch all recognitions
  const {
    data: recognitions,
    isError: isFetchRecognitionsError,
    isSuccess: isFetchRecognitionsSuccess,
    isLoading: isFetchingRecognitions,
  } = useQuery({
    queryKey: ['recognitions'],
    queryFn: async () => {
      // get recognitions (throw error if not found)
      const recognitionToPopulate = ['invite_from', 'invite_to', 'status_id'];
      const response = await Invitation.getAll(`limit=1000&query=${user.user_id}&search_fields[]=invite_from&search_fields[]=invite_to&${recognitionToPopulate.map((x) => `populate=${x}`).join('&')}`);

      // transform results
      response.results = await Promise.all(
        response.results.map(async (invitation) => {
          // fields to populate
          const materialToPopulate = ['source_id', 'type_id', 'author_id'];
          const materials = await Material.getAll(`limit=1&query=${invitation.invite_id}&search_fields[]=invite_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
          const temporaryMaterial = materials?.results?.[0] || null;

          return {
            ...invitation,
            material: temporaryMaterial,
          };
        }),
      );

      // filter out falsy data
      response.results = response.results.filter((x) => x.material);

      return response;
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: shouldFetchRecognitions,
  });

  // fetch single recognition with extra details
  const {
    data: recognitionDetails,
    isError: isFetchRecognitionDetailsError,
    isSuccess: isFetchRecognitionDetailsSuccess,
    isLoading: isFetchingRecognitionDetails,
  } = useQuery({
    queryKey: [`recognition-${recognitionId}`],
    queryFn: async () => {
      // get recognition details
      const recognitionToPopulate = ['invite_from', 'invite_to', 'status_id'];
      const recognitionResponse = await Invitation.getById(recognitionId, recognitionToPopulate.map((x) => `populate=${x}`).join('&'));

      // get details of material for this recognition
      const materialToPopulate = ['source_id', 'type_id', 'author_id'];
      const materials = await Material.getAll(`limit=1&query=${recognitionResponse.invite_id}&search_fields[]=invite_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
      if (materials?.code >= 400) throw new Error('Failed to get recognition');
      const material = materials?.results?.[0] || null;

      // get details of creation of material
      const creationToPopulate = ['source_id', 'author_id', 'materials', 'tags', 'materials.source_id', 'materials.type_id', 'materials.author_id'];
      const creation = material ? await Creation.getAll(`limit=1&query=${material?.material_id}&search_fields[]=material_id&${creationToPopulate.map((x) => `populate=${x}`).join('&')}`) : null;
      if (material && !creation) throw new Error('Failed to get recognition');

      const transformedRecognition = {
        ...recognitionResponse,
        material,
        creation: creation ? creation?.results?.[0] : null,
      };

      return { ...transformedRecognition };
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!recognitionId,
  });

  // update recognition status
  const {
    mutate: updateRecognitionStatus,
    isError: isRecognitionUpdateError,
    isSuccess: isRecognitionUpdated,
    isLoading: isUpdatingRecognition,
    reset: resetUpdateRecognitionStatus,
  } = useMutation({
    mutationFn: async (
      {
        inviteId,
        updatedStatus, // can be accepted or declined
      },
    ) => {
      // console.log('inviteId =>', inviteId);
      // console.log('updatedStatus =>', updatedStatus);
      // find status for an recognition
      const temporaryRecognitions = { ...(recognitionId ? recognitionDetails : recognitions) };
      const foundRecognition = recognitionId
        ? recognitionDetails
        : (temporaryRecognitions.results || []).find((x) => x.invite_id === inviteId);
      if (!foundRecognition) return;

      // update recognition status
      const statusId = foundRecognition.status.status_id;
      const status = await Status.update(statusId, { status_name: updatedStatus });
      foundRecognition.status = status;

      // update queries
      const key = recognitionId ? `recognitions-${recognitionId}` : 'recognitions';
      queryClient.cancelQueries({ queryKey: [key] });
      queryClient.setQueryData([key], () => ({ ...temporaryRecognitions }));
    },
  });

  return {
    recognitions,
    isFetchingRecognitions,
    fetchRecognitions: () => setShouldFetchRecognitions(true),
    fetchRecognitionsStatus: {
      success: isFetchRecognitionsSuccess,
      error: isFetchRecognitionsError ? 'Failed to get recognitions' : null,
    },
    isUpdatingRecognition,
    updateRecognitionStatus,
    updatedRecognitionStatus: {
      success: isRecognitionUpdated,
      error: isRecognitionUpdateError ? 'Failed to update recognition status' : null,
    },
    resetUpdateRecognitionStatus,
    fetchRecognitionDetails: (id) => setRecognitionId(id),
    recognitionDetails,
    isFetchingRecognitionDetails,
    fetchRecognitionDetailsStatus: {
      success: isFetchRecognitionDetailsSuccess,
      error: isFetchRecognitionDetailsError ? 'Failed to fetch recognition details' : null,
    },
  };
};

export default useRecognitions;
