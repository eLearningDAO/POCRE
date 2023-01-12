import useSuggestions from 'hooks/useSuggestions';

const useExplore = () => {
  // author suggestions
  const {
    suggestions: walletSuggestions,
    suggestionsStatus: findUserWalletStatus,
    handleSuggestionInputChange: handleWalletInputChange,
  } = useSuggestions({
    search: 'users',
  });
  return {
    findUserWalletStatus,
    walletSuggestions,
    handleWalletInputChange,
  };
};

export default useExplore;
