import { Creation, Tag, User } from 'api/requests';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const searchMap = {
  users: { method: User.getAll, searchField: 'user_name' },
  creations: { method: Creation.getAll, searchField: 'creation_title' },
  tags: { method: Tag.getAll, searchField: 'tag_name' },
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
  const [searchText, setSearchText] = useState(null);

  const { data, isError, isSuccess } = useQuery({
    queryKey: [`suggestion-${search}-${searchText}`],
    queryFn: async () => {
      const suggestions = await searchMap[search].method(`query=${searchText}&limit=50&search_fields[]=${searchMap[search].searchField}`);

      return suggestions
        ?.results
        ?.filter(
          (x) => (
            filterSuggestion
              ? x[searchMap[search].searchField].trim() !== filterSuggestion.trim()
              : x),
        )?.filter(
          (x) => (
            search === 'creations' && config.is_claimable ? x.is_claimable : x
          ),
        );
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!searchText,
  });

  // get suggestion on input change
  const handleSuggestionInputChange = (event) => setSearchText(event.target.value.trim());

  return {
    suggestions: data,
    suggestionsStatus: {
      success: isSuccess,
      error: isError ? 'Failed to get suggestions' : null,
    },
    handleSuggestionInputChange,
  };
};

export default useSuggestions;
