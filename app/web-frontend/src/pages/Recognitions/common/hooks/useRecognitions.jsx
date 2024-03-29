import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Creation, Material, Recognition, Transaction,
} from 'api/requests';
import { CHARGES } from 'config';
import moment from 'moment';
import { useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const useRecognitions = () => {
  const queryClient = useQueryClient();

  const [shouldFetchRecognitions, setShouldFetchRecognitions] = useState(false);
  const [recognitionIdToFetch, setRecognitionIdToFetch] = useState(null);
  // get auth user
  const user = authUser.getUser();
  // fetch all recognitions
  const queryKey = `recognitions-${user?.user_id}`;
  const {
    data: recognitions,
    isError: isFetchRecognitionsError,
    isSuccess: isFetchRecognitionsSuccess,
    isLoading: isFetchingRecognitions,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      // get recognitions (throw error if not found)
      const recognitionToPopulate = ['recognition_by', 'recognition_for', 'transaction_id'];
      const response = await Recognition.getAll(`limit=1000&query=${user.user_id}&search_fields[]=recognition_by&search_fields[]=recognition_for&${recognitionToPopulate.map((x) => `populate=${x}`).join('&')}`);

      // transform results
      response.results = await Promise.all(
        response.results.map(async (recognition) => {
          // fields to populate
          const materials = await Material.getAll(`limit=1&query=${recognition.recognition_id}&search_fields[]=recognition_id&populate=author_id`);
          const temporaryMaterial = materials?.results?.[0] || null;

          return {
            ...recognition,
            material: temporaryMaterial,
          };
        }),
      );

      // filter out falsy data
      response.results = response.results.filter((x) => x.material);

      // sort by latest first
      response.results = [...response.results].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      // format dates
      response.results = [...response.results].map(
        (x) => ({
          ...x,
          recognition_issued: moment(x?.recognition_issued).format('Do MMMM YYYY'), // moment auto converts utc to local time
          status_updated: moment(x?.status_updated).format('Do MMMM YYYY'), // moment auto converts utc to local time
        }),
      );

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
      const recognitionToPopulate = ['recognition_by', 'recognition_for', 'transaction_id'];
      const recognitionResponse = await Recognition.getById(recognitionIdToFetch, recognitionToPopulate.map((x) => `populate=${x}`).join('&'));

      // get details of material for this recognition
      const materials = await Material.getAll(`limit=1&query=${recognitionResponse.recognition_id}&search_fields[]=recognition_id&populate=author_id`);
      if (materials?.code >= 400) throw new Error('Failed to get recognition');
      const material = materials?.results?.[0] || null;

      // get details of creation of material
      const creationToPopulate = ['author_id', 'materials', 'tags', 'materials.author_id'];
      const creation = material ? await Creation.getAll(`limit=1&query=${material?.material_id}&search_fields[]=material_id&${creationToPopulate.map((x) => `populate=${x}`).join('&')}`) : null;
      if (material && !creation) throw new Error('Failed to get recognition');

      const transformedRecognition = {
        ...recognitionResponse,
        status_updated: moment(recognitionResponse?.status_updated).format('DD/MM/YYYY'), // moment auto converts utc to local time
        recognition_issued: moment(recognitionResponse?.recognition_issued).format('DD/MM/YYYY'), // moment auto converts utc to local time
        material,
        creation: creation ? {
          ...creation?.results?.[0],
          creation_date: moment(creation?.results?.[0]?.creation_date).format('DD/MM/YYYY'), // moment auto converts utc to local time
          creation_authorship_window: moment(creation?.results?.[0]?.creation_authorship_window).format('Do MMMM YYYY'),
        } : null,
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
      // find status for a recognition
      const temporaryRecognitions = { ...(recognitionId ? recognitionDetails : recognitions) };
      const foundRecognition = recognitionId
        ? recognitionDetails
        : (temporaryRecognitions.results || []).find((x) => x.recognition_id === recognitionId);
      if (!foundRecognition) return;

      // require transaction if status is accepted
      const transaction = await (async () => {
        if (updatedStatus === statusTypes.ACCEPTED) {
          const txHash = await transactADAToPOCRE({
            amountADA: CHARGES.RECOGNITION_ACCEPT,
            walletName: authUser.getUser()?.selectedWallet,
            metaData: {
              pocre_id: recognitionId,
              pocre_entity: 'recognition',
              purpose: transactionPurposes.ACCEPT_RECOGNITION,
            },
          });

          if (!txHash) throw new Error('Failed to accept material recognition');

          // make pocre transaction to store this info
          return await await Transaction.create({
            transaction_hash: txHash,
            transaction_purpose: transactionPurposes.ACCEPT_RECOGNITION,
          });
        }
        return '';
      })();

      // update recognition status
      await Recognition.respond(recognitionId, {
        status: updatedStatus,
        status_updated: new Date().toISOString(),
        ...(transaction && { transaction_id: transaction.transaction_id }),
      });

      // update cache
      foundRecognition.status = 'pending';
      foundRecognition.transaction = transaction || {};

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
