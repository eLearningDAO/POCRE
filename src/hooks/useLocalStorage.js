import React, { useEffect } from 'react';

function useLocalStorage(name = 'state', initValue = '') {
  const [state, setState] = React.useState(() => {
    let value = localStorage.getItem(name);
    if (!value) {
      return initValue;
    }
    value = JSON.parse(value);
    return value;
  });

  useEffect(() => {
    localStorage.setItem(name, JSON.stringify(state));
  }, [state]);
  return [state, setState];
}

export default useLocalStorage;
