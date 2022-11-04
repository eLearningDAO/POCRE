import { Tag } from 'api/requests';
import { useCallback, useState } from 'react';

let debounceInterval = null;

const useTagSuggestions = () => {
  const [findTagsStatus, setFindTagsStatus] = useState({
    success: false,
    error: null,
  });
  const [tagSuggestions, setTagSuggestions] = useState([]);

  // get tag suggestions
  const findTagSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await Tag.getAll(`query=${searchText}&search_fields[]=tag_name`);

      setFindTagsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFindTagsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFindTagsStatus({
        success: false,
        error: 'Failed to get tag suggestion',
      });
    }
    return null;
  }, []);

  // get tag suggestion on tag input change
  const handleTagInputChange = async (event) => {
    if (debounceInterval) clearTimeout(debounceInterval);

    debounceInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findTagSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.map(
        (x) => validSuggestions.findIndex((y) => y.tag_name === x.tag_name) <= -1
          && validSuggestions.push(x),
      );

      setTagSuggestions([...tagSuggestions, ...validSuggestions]);
    }, 500);
  };

  return {
    tagSuggestions,
    findTagsStatus,
    handleTagInputChange,
  };
};

export default useTagSuggestions;
