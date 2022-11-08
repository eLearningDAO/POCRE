import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Creation, Recognition, Material, Status,
} from 'api/requests';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';

// get auth user
const user = authUser.get();

const useRecognitions = () => {
  const queryClient = useQueryClient();

  const [shouldFetchRecognitions, setShouldFetchRecognitions] = useState(false);
  const [recognitionIdToFetch, setRecognitionIdToFetch] = useState(null);

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
      const recognitionToPopulate = ['recognition_by', 'recognition_for', 'status_id'];
      const response = await Recognition.getAll(`limit=1000&query=${user.user_id}&search_fields[]=recognition_by&search_fields[]=recognition_for&${recognitionToPopulate.map((x) => `populate=${x}`).join('&')}`);

      // transform results
      response.results = await Promise.all(
        response.results.map(async (recognition) => {
          // fields to populate
          const materialToPopulate = ['source_id', 'type_id', 'author_id'];
          const materials = await Material.getAll(`limit=1&query=${recognition.recognition_id}&search_fields[]=recognition_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
          const temporaryMaterial = materials?.results?.[0] || null;

          return {
            ...recognition,
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
    queryKey: [`recognition-${recognitionIdToFetch}`],
    queryFn: async () => {
      // get recognition details
      const recognitionToPopulate = ['recognition_by', 'recognition_for', 'status_id'];
      const recognitionResponse = await Recognition.getById(recognitionIdToFetch, recognitionToPopulate.map((x) => `populate=${x}`).join('&'));

      // get details of material for this recognition
      const materialToPopulate = ['source_id', 'type_id', 'author_id'];
      const materials = await Material.getAll(`limit=1&query=${recognitionResponse.recognition_id}&search_fields[]=recognition_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
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
    enabled: !!recognitionIdToFetch,
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
        recognitionId,
        updatedStatus, // can be accepted or declined
      },
    ) => {
      // find status for an recognition
      const temporaryRecognitions = { ...(recognitionId ? recognitionDetails : recognitions) };
      const foundRecognition = recognitionId
        ? recognitionDetails
        : (temporaryRecognitions.results || []).find((x) => x.recognition_id === recognitionId);
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
    fetchRecognitionDetails: (id) => setRecognitionIdToFetch(id),
    recognitionDetails,
    isFetchingRecognitionDetails,
    fetchRecognitionDetailsStatus: {
      success: isFetchRecognitionDetailsSuccess,
      error: isFetchRecognitionDetailsError ? 'Failed to fetch recognition details' : null,
    },
  };
};

export default useRecognitions;
