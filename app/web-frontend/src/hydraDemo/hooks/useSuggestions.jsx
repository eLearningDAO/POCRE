import { Creation, Tag, User } from 'api/requests';
import { useMemo, useState } from 'react';

const mockCreations = [
  {
    creation_id: 1,
    creation_title: 'Example creation',
    is_claimable: true,
    materials: [],
  },
];

/**
 * Copied from 'hooks/useSuggestions.jsx' and modified for hydra demo.
 */
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

  const suggestions = useMemo(
    () => mockCreations.filter(
      (x) => x.creation_title.toLowerCase().includes(searchText?.toLowerCase()),
    ),
    [searchText],
  );

  // get suggestion on input change
  const handleSuggestionInputChange = (event) => setSearchText(event.target.value.trim());

  return {
    suggestions,
    suggestionsStatus: {
      success: true,
      error: null,
    },
    handleSuggestionInputChange,
  };
};

export default useSuggestions;
