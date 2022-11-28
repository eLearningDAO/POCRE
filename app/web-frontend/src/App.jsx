import useAppKeys from 'hooks/useAppKeys';
import React from 'react';
import Routes from './routes';

function App() {
  const { appKey } = useAppKeys();

  return (
    <React.Fragment key={appKey}>
      <Routes />
    </React.Fragment>
  );
}

export default App;
