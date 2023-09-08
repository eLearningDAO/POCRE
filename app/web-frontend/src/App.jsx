import useAppKeys from 'hooks/useAppKeys';
import React from 'react';
import { DelegateServerProvider } from 'hydraDemo/contexts/DelegateServerContext';
import Routes from './routes';

function App() {
  const { appKey } = useAppKeys();

  return (
    <React.Fragment key={appKey}>
      <DelegateServerProvider>
        <Routes />
      </DelegateServerProvider>
    </React.Fragment>
  );
}

export default App;
