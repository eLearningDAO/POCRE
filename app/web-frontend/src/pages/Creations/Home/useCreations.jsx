import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { Creation } from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import moment from 'moment';
import transactionPurposes from 'utils/constants/transactionPurposes';

const useCreations = (userId) => {
  const cookieUser = Cookies.get('authUser');
  let user = cookieUser ? JSON.parse(cookieUser)?.user_id : null;
  if (userId) {
    user = userId;
  }
  const queryKey = `creations-${user}`;
  const {
    suggestions: creationSuggestions,
    suggestionsStatus: fetchCreationsSuggestionStatus,
    handleSuggestionInputChange: handleCreationInputChange,
  } = useSuggestions({
    search: 'creations',
  });

  // get creations
  const {
    data: creations,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isLoadingCreations,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const toPopulate = ['author_id', 'materials', 'materials.author_id', 'transactions'];
      const unsortedCreations = await Creation.getAll(
        `page=${1}&limit=100&descend_fields[]=creation_date&query=${user}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // sort by latest first
      return {
        ...unsortedCreations,
        results: [...unsortedCreations.results].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ).map((x) => ({
          ...x,
          creation_date: moment(x?.creation_date).format('Do MMMM YYYY'),
          isCAWPassed: moment().isAfter(moment(x?.creation_authorship_window)),
          cawDate: moment(x?.creation_authorship_window).format('Do MMMM YYYY'),
          isProcessingPublishingPayment: (x?.transactions || [])?.find(
            (t) => !t.is_validated
            && t.transaction_purpose === transactionPurposes.PUBLISH_CREATION,
          ),
          isProcessingFinalizationPayment: (x?.transactions || [])?.find(
            (t) => !t.is_validated
            && t.transaction_purpose === transactionPurposes.FINALIZE_CREATION,
          ),
        })),
      };
    },
    enabled: !!user,
    staleTime: 60_000, // cache for 60 seconds
  });

  return {
    isLoadingCreations,
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Failed to fetch creations' : null,
    },
    creations,
    creationSuggestions,
    fetchCreationsSuggestionStatus,
    handleCreationInputChange,
  };
};

export default useCreations;
