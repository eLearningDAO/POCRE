import { Creation } from 'api/requests';
import { useCallback, useState } from 'react';

let debounceInterval = null;

const useCreationSuggestions = () => {
  const [fetchCreationsStatus, setFetchCreationsStatus] = useState({
    success: false,
    error: null,
  });
  const [creationSuggestions, setCreationSuggestions] = useState([]);

  // get creation suggestions
  const findCreationSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await Creation.getAll(`query=${searchText}&search_fields[]=creation_title`);

      setFetchCreationsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFetchCreationsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFetchCreationsStatus({
        success: false,
        error: 'Failed to get creation suggestion',
      });
    }
    return null;
  }, []);

  // get creation suggestion on creation input change
  const handleCreationInputChange = async (event) => {
    if (debounceInterval) clearTimeout(debounceInterval);

    debounceInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findCreationSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.map(
        (x) => validSuggestions.findIndex((y) => y.creation_title === x.creation_title) <= -1
          && validSuggestions.push(x),
      );

      setCreationSuggestions([
        ...creationSuggestions,
        ...validSuggestions.filter((x) => x.is_claimable),
      ]);
    }, 500);
  };

  return {
    creationSuggestions,
    fetchCreationsStatus,
    handleCreationInputChange,
  };
};

export default useCreationSuggestions;
