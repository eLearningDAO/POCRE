import useSuggestions from 'hooks/useSuggestions';

const useExplore = () => {
  // author suggestions
  const {
    suggestions: userWalletSuggestions,
    suggestionsStatus: findUserWalletStatus,
    handleSuggestionInputChange: handleUserWalletInputChange,
  } = useSuggestions({
    search: 'users',
  });
  return {
    findUserWalletStatus,
    userWalletSuggestions,
    handleUserWalletInputChange,
  };
};

export default useExplore;
