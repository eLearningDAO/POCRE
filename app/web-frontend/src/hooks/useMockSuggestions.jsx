import { Creation, Tag, User } from 'api/requests';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const searchMap = {
  users: { method: User.getAll, searchField: 'user_name' },
  creations: { method: Creation.getAll, searchField: 'creation_title' },
  tags: { method: Tag.getAll, searchField: 'tag_name' },
};

const useMockSuggestions = ({
  // allowed values are users, creations and tags (TODO: add typescript)
  search = 'creations',
  filterSuggestion = null,
  // dedicated config options for each entity search
  config = {
    is_claimable: true,
  },
}) => {
  const [searchText, setSearchText] = useState(null);

  const mockCreations = [
    {
      creation_id: 1,
      creation_title: 'Example creation',
      is_claimable: true,
      materials: [],
    },
  ];

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

export default useMockSuggestions;
