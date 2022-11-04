import { User } from 'api/requests';
import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

let debounceAuthorInterval = null;

const useAuthorSuggestions = () => {
  const [findAuthorsStatus, setFindAuthorsStatus] = useState({
    success: false,
    error: null,
  });
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

  // get author suggestions
  const findAuthorSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await User.getAll(`query=${searchText}&search_fields[]=user_name`);

      setFindAuthorsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFindAuthorsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFindAuthorsStatus({
        success: false,
        error: 'Failed to get user suggestion',
      });
    }
    return null;
  }, []);

  // get tag suggestion on tag input change
  const handleAuthorInputChange = async (event) => {
    if (debounceAuthorInterval) clearTimeout(debounceAuthorInterval);

    debounceAuthorInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findAuthorSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.filter((x) => x.user_name.trim() !== authUser.user_name.trim()).map(
        (x) => validSuggestions.findIndex((y) => y.user_id === x.user_id) <= -1
          && validSuggestions.push(x),
      );

      setAuthorSuggestions([...authorSuggestions, ...validSuggestions]);
    }, 500);
  };

  return {
    findAuthorsStatus,
    authorSuggestions,
    handleAuthorInputChange,
  };
};

export default useAuthorSuggestions;
