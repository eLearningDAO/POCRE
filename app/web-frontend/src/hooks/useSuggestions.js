import { Creation, Tag, User } from 'api/requests';
import { useCallback, useState } from 'react';

let debounceInterval = null;

const searchMap = {
  users: {
    method: User.getAll,
    searchField: 'user_name',
  },
  creations: {
    method: Creation.getAll,
    searchField: 'creation_title',
  },
  tags: {
    method: Tag.getAll,
    searchField: 'tag_name',
  },
  // add more search maps here when needed
};

const useSuggestions = ({
  // allowed values are users, creations and tags (TODO: add typescript)
  search = 'creations',
  filterSuggestion = null,
  // dedicated config options for each entity search
  config = {
    is_claimable: true,
  },
}) => {
  const [suggestionsStatus, setSuggestionsStatus] = useState({
    success: false,
    error: null,
  });
  const [suggestions, setSuggestions] = useState([]);

  // get suggestions
  const findSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await searchMap[search].method(`query=${searchText}&search_fields[]=${searchMap[search].searchField}`);

      setSuggestionsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setSuggestionsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setSuggestionsStatus({
        success: false,
        error: 'Failed to get suggestions',
      });
    }
    return null;
  }, []);

  // get suggestion on input change
  const handleSuggestionInputChange = async (event) => {
    if (debounceInterval) clearTimeout(debounceInterval);

    debounceInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const temporarySuggestions = await findSuggestions(value);

      const validSuggestions = [];

      temporarySuggestions?.results
        ?.filter(
          (x) => (filterSuggestion
            ? x[searchMap[search].searchField].trim() !== filterSuggestion.trim()
            : x),
        )
        ?.map(
          (x) => validSuggestions.findIndex(
            (y) => y[searchMap[search].searchField] === x[searchMap[search].searchField],
          ) <= -1
          && validSuggestions.push(x),
        );

      setSuggestions([
        ...suggestions,
        // this filter is only applied when searching for creation suggestions
        ...validSuggestions.filter((x) => (search === 'creations' && config.is_claimable ? x.is_claimable : x)),
      ]);
    }, 500);
  };

  return {
    suggestions,
    suggestionsStatus,
    handleSuggestionInputChange,
  };
};

export default useSuggestions;
